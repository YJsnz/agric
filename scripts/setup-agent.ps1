[CmdletBinding()]
param([switch]$CheckOnly,[switch]$Cpu)
. "$PSScriptRoot/windows-common.ps1"
Import-LocalEnvironment
$baseUrl = (Get-Setting AGENT_BASE_URL 'http://127.0.0.1:11434/v1').TrimEnd('/')
$model = Get-Setting AGENT_MODEL 'qwen2.5:7b'
if ($Cpu) {
    if ($baseUrl -notin @('http://127.0.0.1:11434/v1','http://localhost:11434/v1')) { throw '-Cpu requires local Ollama.' }
    $model = 'agric-qwen2.5:7b-cpu'
}
$headers = @{}
if ($env:AGENT_API_KEY) { $headers.Authorization = "Bearer $env:AGENT_API_KEY" }
function Get-ConfiguredModels {
    try { return (Invoke-RestMethod -Uri "$baseUrl/models" -Headers $headers -TimeoutSec 5).data.id }
    catch { return @() }
}
$models = @(Get-ConfiguredModels)
if ($models -contains $model) { Write-Host "Agent model ready: $model"; exit 0 }
if ($CheckOnly) { throw 'Configured Agent service or model is unavailable.' }
if ($baseUrl -notin @('http://127.0.0.1:11434/v1','http://localhost:11434/v1')) {
    throw 'Start the configured compatible model service and ensure AGENT_MODEL is available.'
}
Require-Command ollama.exe
try { Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2 | Out-Null }
catch {
    New-Item -ItemType Directory -Path (Join-Path $script:ProjectRoot 'target') -Force | Out-Null
    Start-Process -FilePath (Get-Command ollama.exe).Source -ArgumentList 'serve' -WindowStyle Hidden -RedirectStandardOutput (Join-Path $script:ProjectRoot 'target/ollama-start.log') -RedirectStandardError (Join-Path $script:ProjectRoot 'target/ollama-start-error.log') | Out-Null
    $ready = $false
    for ($attempt=0;$attempt -lt 30;$attempt++) {
        try { Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 1 | Out-Null; $ready=$true; break }
        catch { Start-Sleep -Milliseconds 500 }
    }
    if (!$ready) { throw 'Ollama did not start. See target/ollama-start-error.log.' }
}
$models = @(Get-ConfiguredModels)
if ($models -notcontains $model) {
    if ($model -eq 'agric-qwen2.5:7b-cpu') {
        if ($models -notcontains 'qwen2.5:7b') { Invoke-Checked ollama.exe @('pull','qwen2.5:7b') }
        New-Item -ItemType Directory -Path (Join-Path $script:ProjectRoot 'target') -Force | Out-Null
        $cpuFile = Join-Path $script:ProjectRoot 'target/Modelfile.cpu'
        @('FROM qwen2.5:7b','PARAMETER num_gpu 0','PARAMETER num_ctx 8192') | Set-Content -LiteralPath $cpuFile -Encoding ASCII
        Invoke-Checked ollama.exe @('create',$model,'-f',$cpuFile)
    } else {
        Write-Host "Installing configured model: $model (first run downloads model weights)."
        Invoke-Checked ollama.exe @('pull',$model)
    }
}
if (@(Get-ConfiguredModels) -notcontains $model) { throw 'Model installation did not produce the configured model.' }
Write-Host "Agent model ready: $model"



