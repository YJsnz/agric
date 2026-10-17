[CmdletBinding()]
param()
. "$PSScriptRoot/windows-common.ps1"
Import-LocalEnvironment
$projectRoot=$script:ProjectRoot
$configuration=Join-Path $projectRoot 'ai-service/.integration-runtime/runtime.json'
if(Test-Path -LiteralPath $configuration){
    $settings=Get-Content -LiteralPath $configuration -Raw -Encoding UTF8 | ConvertFrom-Json
    $env:NEO4J_PASSWORD=$settings.password
}
$env:MULTICROP_LLM_BASE_URL=Get-Setting MULTICROP_LLM_BASE_URL (Get-Setting AGENT_BASE_URL 'http://127.0.0.1:11434/v1')
$env:MULTICROP_LLM_MODEL=Get-Setting MULTICROP_LLM_MODEL (Get-Setting AGENT_MODEL 'qwen2.5:7b')
$env:MULTICROP_LLM_API_KEY=Get-Setting MULTICROP_LLM_API_KEY (Get-Setting AGENT_API_KEY 'ollama')
$python=Get-Setting MULTICROP_PYTHON (Join-Path $projectRoot 'vision-runtime/.venv/Scripts/python.exe')
$graphUrl=Get-Setting NEO4J_HTTP_URL 'http://127.0.0.1:7474'
if($graphUrl -eq 'http://127.0.0.1:7474'){
    try{Invoke-WebRequest $graphUrl -UseBasicParsing -TimeoutSec 2 | Out-Null}catch{Invoke-Checked docker.exe @('start','agric-multicrop-neo4j')}
}
$multiCropPort=Get-Setting MULTICROP_PORT '8090'
try{Invoke-WebRequest "http://127.0.0.1:$multiCropPort/api/integration/health" -UseBasicParsing -TimeoutSec 2 | Out-Null;Write-Host 'Multi-crop service is already running.';exit 0}catch{}
Assert-FreePort $multiCropPort
Push-Location $projectRoot
try{Invoke-Checked $python @('ai-service/integration_app.py')}finally{Pop-Location}


