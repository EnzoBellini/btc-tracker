# Testes de segurança (OWASP ZAP + WSTG)

## Pré-requisitos

- App rodando: `npm run dev` (porta 5000)
- [OWASP ZAP](https://www.zaproxy.org/) 2.17+ com **Java 17** (Temurin via winget)
- Python 3 + `pip install zaproxy pyyaml requests`

## Subir o ZAP (Windows)

O `zap.bat` padrão usa Java 11 e falha no ZAP 2.17. Use Java 17:

```powershell
$java17 = "C:\Program Files\Eclipse Adoptium\jre-17.0.19.10-hotspot\bin\java.exe"
$zapDir = "C:\Program Files\ZAP\Zed Attack Proxy"
Set-Location $zapDir
& $java17 -Xmx512m -jar zap-2.17.0.jar -daemon -port 8090 -host 127.0.0.1 -config api.disablekey=true
```

## Rodar scans

```powershell
# Bateria completa (audit + estático + API + ZAP baseline + active)
powershell -ExecutionPolicy Bypass -File run-full-suite.ps1

# Ou individualmente:
cd security
python static-scan.py
powershell -ExecutionPolicy Bypass -File manual-api-tests.ps1
python run-zap-scan.py http://127.0.0.1:5000 8090 4
python run-zap-scan.py http://127.0.0.1:5000 8090 2 --active --active-mins 10
npm audit
```

Relatórios em `security/reports/`.

## Notas

- Sem Docker: use `run-zap-scan.py` (scripts oficiais do container ZAP não são necessários).
- Para **active scan**, use a UI do ZAP com proxy ou expanda o script Python (`zap.ascan.scan`).
- Teste sempre em ambiente local/staging com dados fictícios.
