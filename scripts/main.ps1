[CmdletBinding()]
param(
    [ValidateSet('Start','ReleaseStart','Check','Backup','Restore','Test','Release','JetsonRelease','AgentSetup','VisionSetup','MultiCropSetup','MultiCrop')]
    [string]$Task = 'Start',
    [switch]$SkipBuild,
    [switch]$ExternalDatabase,
    [switch]$Check,
    [switch]$Help,
    [switch]$CheckOnly,
    [switch]$Cpu,
    [switch]$RebuildModel,
    [switch]$InitializeKnowledge,
    [string]$BackupFile,
    [string]$TargetDatabase,
    [string]$VisionOutput,
    [string]$OutputDirectory,
    [string]$JarFile = 'target/ty-0.0.1-SNAPSHOT.jar',
    [switch]$IncludeMultiCrop
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
. (Join-Path $PSScriptRoot 'windows-common.ps1')
Set-Location $projectRoot
if ($Task -eq 'Start' -and (Test-Path (Join-Path $projectRoot 'application.jar'))) { $Task = 'ReleaseStart' }
if ($Help) {
    Write-Host 'Usage: .\start.cmd [-SkipBuild] [-ExternalDatabase] [-Check] [-Cpu]'
    Write-Host '       .\start.cmd -Task <Check|Backup|Restore|Test|Release|JetsonRelease|AgentSetup|VisionSetup|MultiCropSetup|MultiCrop>'
    exit 0
}

function Invoke-ProjectScript([string]$Name, [hashtable]$Arguments = @{}) {
    $scriptPath = Join-Path $PSScriptRoot $Name
    if (!(Test-Path -LiteralPath $scriptPath)) { throw "Internal task script missing: scripts/$Name" }
    & $scriptPath @Arguments
    if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "Task $Name failed (exit $LASTEXITCODE)." }
    if ($?) { return }
    throw "Task $Name failed."
}

try {
    switch ($Task) {
        'Start' {
            Import-LocalEnvironment
            Require-Command java.exe
            Require-Command javac.exe
            $version = (& java.exe --version | Out-String)
            if ($LASTEXITCODE -ne 0 -or $version -notmatch '(?:openjdk|java)\s+(\d+)' -or [int]$Matches[1] -lt 17) { throw 'A JDK version 17 or newer is required.' }
            Require-Command node.exe
            Require-Command npm.cmd
            if ([int]((& node.exe -p 'parseInt(process.versions.node)') | Select-Object -First 1) -lt 24) { throw 'Node.js 24 or newer is required.' }
            if (!$ExternalDatabase) { Initialize-MySql }
            elseif (!$env:DB_URL) { throw '-ExternalDatabase requires DB_URL in .env.local or the environment.' }
            $port = Get-Setting SERVER_PORT '8081'
            if ($Check) { Write-Host 'Prerequisites and database are ready.'; exit 0 }
            Assert-FreePort $port
            Invoke-ProjectScript 'setup-agent.ps1' @{ Cpu = $Cpu }
            if (!$SkipBuild) {
                Invoke-ProjectScript 'setup-vision.ps1' @{ RebuildModel = $RebuildModel }
                if (Test-Path (Join-Path $projectRoot 'ai-service/integration_app.py')) {
                    $initArgs = @{}
                    if (!(Test-Path (Join-Path $projectRoot 'ai-service/.integration-runtime/runtime.json'))) { $initArgs.InitializeKnowledge = $true }
                    Invoke-ProjectScript 'setup-multicrop.ps1' $initArgs
                }
                Invoke-Checked npm.cmd @('ci', '--prefix', 'agent-runtime', '--no-audit', '--no-fund')
                foreach ($app in @('landing', 'frontend', 'vision-frontend')) {
                    Push-Location (Join-Path $projectRoot $app)
                    try {
                        Write-Host "Installing and building $app..."
                        Invoke-Checked npm.cmd @('ci', '--no-audit', '--no-fund')
                        Invoke-Checked npm.cmd @('run', 'build')
                    } finally { Pop-Location }
                }
            }
            if (!(Test-Path (Join-Path $projectRoot 'agent-runtime/node_modules/@deepseek-ai/dsh-sdk-client/lib/index.js'))) { throw 'Harness dependencies missing. Run start.cmd or npm ci --prefix agent-runtime.' }
            Write-Host "Open http://localhost:$port/ after Spring Boot starts. Ctrl+C stops the backend; database data remains in Docker."
            Push-Location $projectRoot
            try { Invoke-Checked (Join-Path $projectRoot 'mvnw.cmd') @('spring-boot:run') } finally { Pop-Location }
        }
        'ReleaseStart' {
            Import-LocalEnvironment
            Require-Command java.exe
            Require-Command node.exe
            Require-Command npm.cmd
            if (!(Test-Path (Join-Path $projectRoot 'application.jar'))) { throw 'application.jar is missing from this release folder.' }
            $version = (& java.exe --version | Out-String)
            if ($LASTEXITCODE -ne 0 -or $version -notmatch '(?:openjdk|java)\s+(\d+)' -or [int]$Matches[1] -lt 17) { throw 'Java 17 or newer is required.' }
            if ([int]((& node.exe -p 'parseInt(process.versions.node)') | Select-Object -First 1) -lt 24) { throw 'Node.js 24 or newer is required.' }
            Initialize-MySql
            if (!$env:AGENT_MODEL) { $env:AGENT_MODEL = 'qwen2.5:7b' }
            Invoke-ProjectScript 'setup-agent.ps1' @{}
            if (!(Test-Path (Join-Path $projectRoot 'agent-runtime/node_modules/@deepseek-ai/dsh-sdk-client/lib/index.js'))) {
                Invoke-Checked npm.cmd @('ci', '--prefix', 'agent-runtime', '--no-audit', '--no-fund')
            }
            Invoke-ProjectScript 'setup-vision.ps1' @{}
            Write-Host "Open http://localhost:$(Get-Setting SERVER_PORT '8081')/"
            Invoke-Checked java.exe @('-jar', 'application.jar')
        }
        'Check' { Import-LocalEnvironment; Initialize-MySql; Write-Host 'Prerequisites and database are ready.' }
        'Backup' { Invoke-ProjectScript 'backup.ps1' @{ OutputDirectory = $OutputDirectory } }
        'Restore' {
            if (!$BackupFile -or !$TargetDatabase) { throw 'Restore requires -BackupFile and -TargetDatabase.' }
            $args = @{ BackupFile = $BackupFile; TargetDatabase = $TargetDatabase }
            if ($VisionOutput) { $args.VisionOutput = $VisionOutput }
            Invoke-ProjectScript 'restore.ps1' $args
        }
        'Test' { Invoke-ProjectScript 'test.ps1' }
        'Release' {
            $args = @{ JarFile = $JarFile }
            if ($IncludeMultiCrop) { $args.IncludeMultiCrop = $true }
            Invoke-ProjectScript 'create-release.ps1' $args
        }
        'JetsonRelease' {
            $args = @{ JarFile = $JarFile }
            if ($IncludeMultiCrop) { $args.IncludeMultiCrop = $true }
            Invoke-ProjectScript 'create-jetson-release.ps1' $args
        }
        'AgentSetup' {
            $setupArgs = @{ Cpu = $Cpu }
            if ($CheckOnly) { $setupArgs.CheckOnly = $true }
            Invoke-ProjectScript 'setup-agent.ps1' $setupArgs
        }
        'VisionSetup' { Invoke-ProjectScript 'setup-vision.ps1' @{ RebuildModel = $RebuildModel } }
        'MultiCropSetup' {
            $args = @{}
            if ($InitializeKnowledge) { $args.InitializeKnowledge = $true }
            Invoke-ProjectScript 'setup-multicrop.ps1' $args
        }
        'MultiCrop' { Invoke-ProjectScript 'start-multicrop.ps1' }
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

