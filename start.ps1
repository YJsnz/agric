[CmdletBinding()]
param([switch]$SkipBuild, [switch]$ExternalDatabase, [switch]$Check, [switch]$Help)
. "$PSScriptRoot/scripts/windows-common.ps1"
try {
    if ($Help) {
        Write-Host 'Usage: .\start.ps1 [-SkipBuild] [-ExternalDatabase] [-Check]'
        Write-Host 'Reads .env.local; initializes Docker MySQL, builds both frontends, then starts the backend.'
        exit 0
    }
    Import-LocalEnvironment
    Require-Command java.exe
    Require-Command javac.exe
    $version = (& java.exe --version | Out-String)
    if ($LASTEXITCODE -ne 0 -or $version -notmatch '(?:openjdk|java)\s+(\d+)' -or [int]$Matches[1] -lt 17) { throw 'A JDK version 17 or newer is required.' }
    Require-Command node.exe
    Require-Command npm.cmd
    if ([int]((& node.exe -p 'parseInt(process.versions.node)') | Select-Object -First 1) -lt 24) { throw 'DeepSeek Harness requires Node.js 24 or newer.' }
    if (!$ExternalDatabase) { Initialize-MySql }
    elseif (!$env:DB_URL) { throw '-ExternalDatabase requires DB_URL in .env.local or the environment.' }
    $port = Get-Setting SERVER_PORT '8081'
    if ($Check) { Write-Host 'Prerequisites and database are ready.'; exit 0 }
    Assert-FreePort $port
    & "$PSScriptRoot/setup-agent.ps1"
    if ($LASTEXITCODE -ne 0) { throw 'Agent model setup failed.' }
    if (!$SkipBuild) {
        & "$PSScriptRoot/setup-vision.ps1"
        if(Test-Path "$PSScriptRoot/ai-service/integration_app.py"){
            if(Test-Path "$PSScriptRoot/ai-service/.integration-runtime/runtime.json"){ & "$PSScriptRoot/setup-multicrop.ps1" }
            else{ & "$PSScriptRoot/setup-multicrop.ps1" -InitializeKnowledge }
            if($LASTEXITCODE -ne 0){throw 'Multi-crop runtime setup failed.'}
        }
        Invoke-Checked npm.cmd @('ci', '--prefix', 'agent-runtime', '--no-audit', '--no-fund')
        foreach ($app in @('landing', 'frontend','vision-frontend')) {
            Push-Location (Join-Path $PSScriptRoot $app)
            try {
                Write-Host "Installing and building $app..."
                Invoke-Checked npm.cmd @('ci', '--no-audit', '--no-fund')
                Invoke-Checked npm.cmd @('run', 'build')
            } finally { Pop-Location }
        }
    }
    if (!(Test-Path "$PSScriptRoot/agent-runtime/node_modules/@deepseek-ai/dsh-sdk-client/lib/index.js")) { throw 'Harness dependencies missing. Run npm ci --prefix agent-runtime or start without -SkipBuild.' }
    Write-Host "Open http://localhost:$port/ after Spring Boot starts. Ctrl+C stops the backend; MySQL data remains in Docker."
    Push-Location $PSScriptRoot
    try { Invoke-Checked "$PSScriptRoot/mvnw.cmd" @('spring-boot:run') } finally { Pop-Location }
} catch { Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red; exit 1 }
