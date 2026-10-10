$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$graphPort = if ($env:GRAPH_WEB_PORT) { [int]$env:GRAPH_WEB_PORT } else { 8090 }
if (Get-NetTCPConnection -State Listen -LocalPort $graphPort -ErrorAction SilentlyContinue) {
    throw "Port $graphPort is occupied. Check the running service first."
}
New-Item -ItemType Directory -Path logs -Force | Out-Null
$python = Join-Path $PSScriptRoot '../.venv/Scripts/python.exe'
if (-not (Test-Path $python)) { throw 'Install graph_web/requirements.txt in ai-service/.venv first.' }
$graphProcess = Start-Process -FilePath $python -ArgumentList '-m','uvicorn','api:app','--host','127.0.0.1','--port',"$graphPort" -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput logs/stdout.log -RedirectStandardError logs/stderr.log -PassThru
$graphProcess.Id | Set-Content logs/launcher.pid
Write-Host "Graph website starting: http://localhost:$graphPort/"
