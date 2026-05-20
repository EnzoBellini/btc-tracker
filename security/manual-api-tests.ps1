# Testes WSTG — headers, auth, IDOR, MEXC, rate limit, injeção básica
param(
    [string]$Base = "http://127.0.0.1:5000"
)

$ReportDir = Join-Path $PSScriptRoot "reports"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$Out = Join-Path $ReportDir "manual-api-$ts.json"
$findings = [System.Collections.Generic.List[object]]@()

function Add-Finding($id, $severity, $title, $detail) {
    $findings.Add([pscustomobject]@{ id=$id; severity=$severity; title=$title; detail=$detail })
}

function Invoke-ApiRaw($Method, $Path, $Body = $null, $Session = $null) {
    $uri = "$Base$Path"
    $params = @{
        Uri = $uri
        Method = $Method
        UseBasicParsing = $true
        ErrorAction = 'Stop'
    }
    if ($Session) { $params.WebSession = $Session }
    if ($null -ne $Body) {
        $params.ContentType = 'application/json'
        $params.Body = if ($Body -is [string]) { $Body } else { $Body | ConvertTo-Json -Compress }
    }
    try {
        $r = Invoke-WebRequest @params
        return @{ ok=$true; status=$r.StatusCode; body=$r.Content; headers=$r.Headers }
    } catch {
        $resp = $_.Exception.Response
        if ($resp) {
            $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
            $text = $reader.ReadToEnd()
            return @{ ok=$false; status=[int]$resp.StatusCode; body=$text; headers=@{} }
        }
        return @{ ok=$false; status=0; body=$_.Exception.Message; headers=@{} }
    }
}

function Register-And-Login($email, $password) {
    $sess = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $reg = Invoke-ApiRaw POST "/api/auth/register" @{ email = $email; password = $password } $sess
    if ($reg.status -eq 409) {
        $login = Invoke-ApiRaw POST "/api/auth/login" @{ email = $email; password = $password } $sess
        if ($login.status -ne 200) {
            return $null
        }
        return $sess
    }
    if ($reg.status -in 200, 201) { return $sess }
    return $null
}

# --- Headers ---
$root = Invoke-ApiRaw GET "/"
$hdr = $root.headers
@('X-Frame-Options','X-Content-Type-Options') | ForEach-Object {
    if (-not $hdr.ContainsKey($_)) {
        Add-Finding "HDR-$_" "Medium" "Header ausente: $_" "GET /"
    }
}
# CSP e HSTS só obrigatórios em produção HTTPS
if ($hdr['X-Powered-By']) {
    Add-Finding "HDR-X-Powered-By" "Low" "X-Powered-By exposto" $hdr['X-Powered-By']
}

# --- Rotas protegidas ---
@(
    '/api/trades','/api/settings','/api/mexc/credentials','/api/stats','/api/goals',
    '/api/onboarding/progress','/api/user-rules','/api/btc-holdings','/api/transfers'
) | ForEach-Object {
    $r = Invoke-ApiRaw GET $_
    if ($r.status -ne 401) {
        Add-Finding "AUTH-$_" "High" "Sem auth permitiu acesso" "GET $_ => $($r.status)"
    }
}

# --- Registro / login ---
$tsId = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$emailA = "sec-a-$tsId@test.local"
$emailB = "sec-b-$tsId@test.local"
$pwd = "SecTest!Aa1$tsId"

$sessA = Register-And-Login $emailA $pwd
$sessB = Register-And-Login $emailB $pwd

if (-not $sessA -or -not $sessB) {
    Add-Finding "AUTH-SETUP" "High" "Falha criar usuários de teste" "A=$([bool]$sessA) B=$([bool]$sessB)"
} else {
    Add-Finding "AUTH-SETUP" "Info" "Usuários de teste OK" "$emailA / $emailB"

    # Criar trade user A
    $tradeBody = @{
        date = "2026-05-20"
        pair = "BTCUSDT"
        direction = "LONG"
        entryPrice = 100
        stopPrice = 90
        targetPrice = 110
        positionSize = 1
        leverage = 3
        pnl = 0
        status = "OPEN"
        notes = "pentest-idor"
    }
    $created = Invoke-ApiRaw POST "/api/trades" $tradeBody $sessA
    if ($created.status -eq 201) {
        $trade = $created.body | ConvertFrom-Json
        $listB = Invoke-ApiRaw GET "/api/trades" $sessB
        if ($listB.status -eq 200 -and ($listB.body | ConvertFrom-Json | Where-Object { $_.id -eq $trade.id })) {
            Add-Finding "IDOR-LIST" "Critical" "User B listou trade do user A" "trade id $($trade.id)"
        }
        $idorPatch = Invoke-ApiRaw PATCH "/api/trades/$($trade.id)" @{ pnl = 999 } $sessB
        try {
            $idorDelR = Invoke-WebRequest -Uri "$Base/api/trades/$($trade.id)" -Method DELETE -WebSession $sessB -UseBasicParsing -ErrorAction Stop
            $idorDel = @{ status = $idorDelR.StatusCode }
        } catch {
            $resp = $_.Exception.Response
            $idorDel = @{ status = if ($resp) { [int]$resp.StatusCode } else { 0 } }
        }

        if ($idorPatch.status -eq 200) {
            Add-Finding "IDOR-PATCH" "Critical" "IDOR alteração trade" "User B PATCH $($trade.id)"
        }
        if ($idorDel.status -in 200, 204) {
            Add-Finding "IDOR-DEL" "Critical" "IDOR exclusão trade" "User B DELETE $($trade.id)"
        }
    }

    # MEXC secret mascarado
    Invoke-ApiRaw PATCH "/api/mexc/credentials" @{
        apiKey = "test-key-123"
        secretKey = "super-secret-value"
        isConnected = $false
    } $sessA | Out-Null
    $mexc = Invoke-ApiRaw GET "/api/mexc/credentials" $sessA
    if ($mexc.status -eq 200) {
        if ($mexc.body -match 'super-secret-value') {
            Add-Finding "DATA-MEXC" "Critical" "secretKey exposto na API" $mexc.body.Substring(0, [Math]::Min(300, $mexc.body.Length))
        } elseif ($mexc.body -match '••••') {
            Add-Finding "DATA-MEXC" "Info" "secretKey mascarado" "OK"
        }
    }

    # User B não lê credenciais de A (mesmo endpoint, dados próprios)
    $mexcB = Invoke-ApiRaw GET "/api/mexc/credentials" $sessB
    if ($mexcB.body -match 'test-key-123') {
        Add-Finding "IDOR-MEXC" "Critical" "User B viu apiKey do user A" $mexcB.body
    }

    # /api/auth/me sem vazar campos sensíveis
    $me = Invoke-ApiRaw GET "/api/auth/me" $null $sessA
    if ($me.body -match 'passwordHash|"password"\s*:') {
        Add-Finding "DATA-ME" "High" "auth/me vaza senha/hash" $me.body
    }
}

# --- Rate limit login (amostra) ---
$rateHits = 0
for ($i = 0; $i -lt 20; $i++) {
    $r = Invoke-ApiRaw POST "/api/auth/login" @{ email = "nobody@test.local"; password = "x" }
    if ($r.status -eq 429) { $rateHits++; break }
}
if ($rateHits -eq 0) {
    Add-Finding "RATE-LOGIN" "Low" "Rate limit não acionou em 20 tentativas" "Pode precisar mais requests"
} else {
    Add-Finding "RATE-LOGIN" "Info" "Rate limit login OK" "429 após tentativas"
}

# --- Injeção básica em query ---
$inj = Invoke-ApiRaw GET "/api/auth/verify-email?token=' OR '1'='1"
if ($inj.status -eq 200) {
    Add-Finding "INJ-TOKEN" "High" "Verify-email aceitou token suspeito" $inj.body
}

# --- Métodos perigosos ---
$opts = Invoke-ApiRaw OPTIONS "/api/trades"
Add-Finding "HTTP-OPTIONS" "Info" "OPTIONS /api/trades" "Status $($opts.status)"

$report = @{
    target = $Base
    scanned_at = (Get-Date).ToUniversalTime().ToString("o")
    finding_count = $findings.Count
    by_severity = @{}
    findings = $findings
}
foreach ($f in $findings) {
    $s = $f.severity
    if (-not $report.by_severity.ContainsKey($s)) { $report.by_severity[$s] = 0 }
    $report.by_severity[$s]++
}
$report | ConvertTo-Json -Depth 8 | Set-Content -Path $Out -Encoding UTF8
Write-Host "Relatório: $Out"
exit $(if ($findings | Where-Object { $_.severity -in 'Critical','High' }) { 1 } else { 0 })
