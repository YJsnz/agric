[CmdletBinding()]
param()
. "$PSScriptRoot/scripts/windows-common.ps1"
Import-LocalEnvironment
$configuration=Join-Path $PSScriptRoot 'ai-service/.integration-runtime/runtime.json'
if(Test-Path -LiteralPath $configuration){
    $settings=Get-Content -LiteralPath $configuration -Raw -Encoding UTF8 | ConvertFrom-Json
    $env:NEO4J_PASSWORD=$settings.password
}
$env:MULTICROP_LLM_BASE_URL=Get-Setting MULTICROP_LLM_BASE_URL (Get-Setting AGENT_BASE_URL 'http://127.0.0.1:11434/v1')
$env:MULTICROP_LLM_MODEL=Get-Setting MULTICROP_LLM_MODEL (Get-Setting AGENT_MODEL 'qwen2.5:7b')
$env:MULTICROP_LLM_API_KEY=Get-Setting MULTICROP_LLM_API_KEY (Get-Setting AGENT_API_KEY 'ollama')
$python=Get-Setting MULTICROP_PYTHON (Join-Path $PSScriptRoot 'vision-runtime/.venv/Scripts/python.exe')
Assert-FreePort (Get-Setting MULTICROP_PORT '8090')
Push-Location $PSScriptRoot
try{Invoke-Checked $python @('ai-service/integration_app.py')}finally{Pop-Location}
