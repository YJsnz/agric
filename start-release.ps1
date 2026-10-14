[CmdletBinding()]
param([switch]$ExternalDatabase,[switch]$Check)
. "$PSScriptRoot/scripts/windows-common.ps1"
Import-LocalEnvironment
Require-Command java.exe
Require-Command node.exe
Require-Command npm.cmd
$version = (& java.exe --version | Out-String)
if ($version -notmatch '(?:openjdk|java)\s+(\d+)' -or [int]$Matches[1] -lt 17) { throw 'Java 17 or newer is required.' }
if ([int]((& node.exe -p 'parseInt(process.versions.node)') | Select-Object -First 1) -lt 24) { throw 'Node 24 or newer is required.' }
if (!$ExternalDatabase) { Initialize-MySql }
elseif (!$env:DB_URL) { throw '-ExternalDatabase requires DB_URL.' }
$jar = Join-Path $PSScriptRoot 'application.jar'
if (!(Test-Path -LiteralPath $jar)) { throw 'application.jar missing; use the generated release folder.' }
if ($Check) { Write-Host 'Release prerequisites and database ready.'; exit 0 }
Assert-FreePort (Get-Setting SERVER_PORT '8081')
if (!$env:AGENT_MODEL) { $env:AGENT_MODEL='agric-qwen2.5:7b-cpu' }
& "$PSScriptRoot/setup-agent.ps1"
Push-Location $PSScriptRoot
try {
    if (!(Test-Path 'agent-runtime/node_modules/@deepseek-ai/dsh-sdk-client/lib/index.js')) {
        Invoke-Checked npm.cmd @('ci','--prefix','agent-runtime','--no-audit','--no-fund')
    }
    & "$PSScriptRoot/setup-vision.ps1"
    if(Test-Path "$PSScriptRoot/ai-service/integration_app.py"){
        if(Test-Path "$PSScriptRoot/ai-service/.integration-runtime/runtime.json"){ & "$PSScriptRoot/setup-multicrop.ps1" }
        else{ & "$PSScriptRoot/setup-multicrop.ps1" -InitializeKnowledge }
    }
    Write-Host "Open http://localhost:$(Get-Setting SERVER_PORT '8081')/"
    Invoke-Checked java.exe @('-jar',$jar)
} finally { Pop-Location }
