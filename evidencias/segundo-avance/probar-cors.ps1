# Ejecuta este archivo en PowerShell con el servidor de EduCursos ya encendido.
# Solo hace dos solicitudes OPTIONS; no modifica datos.
# Filtra Set-Cookie para no mostrar identificadores de sesión.
$uri = 'http://localhost:8000/api/v1/courses'

function Invoke-CorsCheck([string]$label, [string]$origin) {
    Write-Host "`n=== $label ===" -ForegroundColor Cyan
    curl.exe --include --silent --show-error --request OPTIONS $uri `
      --header "Origin: $origin" `
      --header 'Access-Control-Request-Method: GET' |
      Where-Object { $_ -match '^(HTTP/|Access-Control-Allow-Origin:|Access-Control-Allow-Methods:|Access-Control-Allow-Headers:|Content-Type:|\{"ok":)' }
}

Invoke-CorsCheck 'ORIGEN PERMITIDO: debe responder 204' 'http://localhost:8000'
Invoke-CorsCheck 'ORIGEN AJENO: debe responder 403' 'https://sitio-no-autorizado.example'
