$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
Write-Host 'Brasa Alta disponível em http://localhost:4173' -ForegroundColor Yellow
Write-Host 'Pressione Ctrl+C para encerrar.'
node server.mjs
