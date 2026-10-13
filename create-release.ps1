[CmdletBinding()]
param([string]$JarFile='target/ty-0.0.1-SNAPSHOT.jar',[switch]$IncludeMultiCrop)
$ErrorActionPreference='Stop'
$jar=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot $JarFile)).Path
$root=Join-Path $PSScriptRoot ('target/release-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $root -Force | Out-Null
Copy-Item -LiteralPath $jar -Destination (Join-Path $root 'application.jar')
foreach ($file in @('start-release.ps1','start-release.cmd','setup-agent.ps1','setup-agent.cmd','setup-vision.ps1','setup-vision.cmd','backup.ps1','backup.cmd','restore.ps1','restore.cmd','.env.example')) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination $root
}
foreach ($folder in @('scripts','agent-runtime','vision-runtime','vision-runtime/models','docs')) {
    New-Item -ItemType Directory -Path (Join-Path $root $folder) -Force | Out-Null
}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'scripts/windows-common.ps1') -Destination (Join-Path $root 'scripts')
foreach ($file in @('package.json','package-lock.json','run.mjs','agriculture-plugin.mjs','tool-scope.mjs','resource-limits.mjs')) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot "agent-runtime/$file") -Destination (Join-Path $root 'agent-runtime')
}
foreach ($file in @('infer.py','pipeline.py','backends.py','tensorrt_backend.py','build_engine.py','benchmark.py','export_model.py','requirements.txt')) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot "vision-runtime/$file") -Destination (Join-Path $root 'vision-runtime')
}
foreach ($file in @('pear-leaf.onnx','manifest.json')) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot "vision-runtime/models/$file") -Destination (Join-Path $root 'vision-runtime/models')
}
if (Test-Path (Join-Path $PSScriptRoot 'vision-runtime/cache/UPSTREAM-LICENSE.txt')) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'vision-runtime/cache/UPSTREAM-LICENSE.txt') -Destination (Join-Path $root 'vision-runtime/models')
}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'docs/软件演示交付检查.md') -Destination (Join-Path $root 'docs')
@('Saltfield Software Demo','Run start-release.cmd. Requires Java 17+, Node 24+, Python 3.11, Docker Desktop and Ollama.','First start installs runtime dependencies. Model weights and user data are excluded.','See docs for configuration, backups and restoration.') | Set-Content -LiteralPath (Join-Path $root 'README.txt') -Encoding UTF8
$zip="$root.zip"
if($IncludeMultiCrop) {
    & "$PSScriptRoot/scripts/package-multicrop.ps1" -Destination $root
}
Compress-Archive -Path (Join-Path $root '*') -DestinationPath $zip
Write-Host "Release folder: $root"
Write-Host "Release archive: $zip"
