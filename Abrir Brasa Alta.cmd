@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -Command "$ErrorActionPreference='Stop'; $url='http://127.0.0.1:4173/'; $health=$url+'api/health/loja'; function Ready { try { (Invoke-RestMethod -Uri $health -TimeoutSec 1).service -eq 'loja' } catch { $false } }; if (Ready) { Start-Process $url; exit 0 }; $node=Get-Command node.exe -ErrorAction Stop; $server=Start-Process -FilePath $node.Source -ArgumentList 'server.mjs' -NoNewWindow -PassThru; for ($i=0; $i -lt 20; $i++) { if (Ready) { Write-Host ('Brasa Alta disponivel em ' + $url); Write-Host 'Deixe esta janela aberta para manter a loja no ar.'; Start-Process $url; $server.WaitForExit(); exit $server.ExitCode }; if ($server.HasExited) { exit 1 }; Start-Sleep -Milliseconds 250 }; if (-not $server.HasExited) { $server.Kill() }; throw 'O servidor nao respondeu na porta 4173.'"
if errorlevel 1 (
  echo.
  echo Nao foi possivel iniciar a Brasa Alta. Confira a mensagem acima.
  pause
)
