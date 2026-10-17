[CmdletBinding()]
param([string]$JarFile='target/ty-0.0.1-SNAPSHOT.jar',[switch]$IncludeMultiCrop)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'windows-common.ps1')
$jar=(Resolve-Path -LiteralPath (Join-Path $script:ProjectRoot $JarFile)).Path
$root=Join-Path $script:ProjectRoot ('target/release-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $root -Force | Out-Null
Copy-Item -LiteralPath $jar -Destination (Join-Path $root 'application.jar')
foreach ($file in @('.env.example')) {
    Copy-Item -LiteralPath (Join-Path $script:ProjectRoot $file) -Destination $root
}
foreach ($folder in @('scripts','agent-runtime','vision-runtime','vision-runtime/models','docs')) {
    New-Item -ItemType Directory -Path (Join-Path $root $folder) -Force | Out-Null
}
Copy-Item -LiteralPath (Join-Path $script:ProjectRoot 'scripts/windows-common.ps1') -Destination (Join-Path $root 'scripts')
foreach ($file in @('main.ps1','setup-agent.ps1','setup-vision.ps1','backup.ps1','restore.ps1')) {
    Copy-Item -LiteralPath (Join-Path $script:ProjectRoot "scripts/$file") -Destination (Join-Path $root 'scripts')
}
foreach ($file in @('setup-multicrop.ps1','start-multicrop.ps1')) {
    Copy-Item -LiteralPath (Join-Path $script:ProjectRoot "scripts/$file") -Destination (Join-Path $root 'scripts')
}
Copy-Item -LiteralPath (Join-Path $script:ProjectRoot 'start.cmd') -Destination $root
foreach ($file in @('package.json','package-lock.json','run.mjs','agriculture-plugin.mjs','tool-scope.mjs','resource-limits.mjs')) {
    Copy-Item -LiteralPath (Join-Path $script:ProjectRoot "agent-runtime/$file") -Destination (Join-Path $root 'agent-runtime')
}
foreach ($file in @('infer.py','pipeline.py','backends.py','tensorrt_backend.py','build_engine.py','benchmark.py','export_model.py','requirements.txt')) {
    Copy-Item -LiteralPath (Join-Path $script:ProjectRoot "vision-runtime/$file") -Destination (Join-Path $root 'vision-runtime')
}
foreach ($file in @('pear-leaf.onnx','manifest.json')) {
    Copy-Item -LiteralPath (Join-Path $script:ProjectRoot "vision-runtime/models/$file") -Destination (Join-Path $root 'vision-runtime/models')
}
if (Test-Path (Join-Path $script:ProjectRoot 'vision-runtime/cache/UPSTREAM-LICENSE.txt')) {
    Copy-Item -LiteralPath (Join-Path $script:ProjectRoot 'vision-runtime/cache/UPSTREAM-LICENSE.txt') -Destination (Join-Path $root 'vision-runtime/models')
}
Copy-Item -LiteralPath (Join-Path $script:ProjectRoot 'docs/软件演示交付检查.md') -Destination (Join-Path $root 'docs')
@('Saltfield Software Demo','Run start.cmd. Requires Java 17+, Node 24+, Python 3.11, Docker Desktop and Ollama.','First start installs runtime dependencies. Model weights and user data are excluded.','See docs for configuration, backups and restoration.') | Set-Content -LiteralPath (Join-Path $root 'README.txt') -Encoding UTF8
$zip="$root.zip"
if($IncludeMultiCrop) {
    & (Join-Path $script:ProjectRoot 'scripts/package-multicrop.ps1') -Destination $root
}
Compress-Archive -Path (Join-Path $root '*') -DestinationPath $zip
Write-Host "Release folder: $root"
Write-Host "Release archive: $zip"



