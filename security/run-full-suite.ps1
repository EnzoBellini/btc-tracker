# Bateria completa de testes de segurança (gratuitos)
param(
    [string]$Base = "http://127.0.0.1:5000",
    [int]$ZapPort = 8090,
    [switch]$SkipActive
)

$ErrorActionPreference = "Continue"
$Root = Split-Path $PSScriptRoot -Parent
$ReportDir = Join-Path $PSScriptRoot "reports"
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$results = [ordered]@{ started_at = (Get-Date).ToUniversalTime().ToString("o"); steps = @() }

function Step($name, $script) {
    Write-Host "`n=== $name ===" -ForegroundColor Cyan
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $code = 0
    try { & $script } catch { $code = 1; $_ | Out-String | Write-Host }
    if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) { $code = $LASTEXITCODE }
    $sw.Stop()
    $results.steps += [ordered]@{ name=$name; exit_code=$code; seconds=[int]$sw.Elapsed.TotalSeconds }
    return $code
}

# npm audit
Step "npm audit" {
    Set-Location $Root
    npm audit --json 2>$null | Out-File (Join-Path $ReportDir "npm-audit-$ts.json") -Encoding utf8
    npm audit 2>&1
}

# static
Step "static-scan" {
    Set-Location (Join-Path $Root "security")
    python static-scan.py
}

# manual API
Step "manual-api" {
    & (Join-Path $PSScriptRoot "manual-api-tests.ps1") -Base $Base
}

# ZAP baseline
Step "zap-baseline" {
    Set-Location (Join-Path $Root "security")
    python run-zap-scan.py $Base $ZapPort 4
}

if (-not $SkipActive) {
    Step "zap-active" {
        Set-Location (Join-Path $Root "security")
        python run-zap-scan.py $Base $ZapPort 2 --active --active-mins 8
    }
}

$summaryPath = Join-Path $ReportDir "suite-$ts.json"
$results | ConvertTo-Json -Depth 4 | Set-Content $summaryPath -Encoding UTF8
Write-Host "`nSuite concluída: $summaryPath" -ForegroundColor Green
$results.steps | Format-Table
