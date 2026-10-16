[CmdletBinding()]
param([string]$JarFile='target/ty-0.0.1-SNAPSHOT.jar',[switch]$IncludeMultiCrop)
$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
$destination=Join-Path $project ('target/jetson-release-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $destination | Out-Null
Copy-Item -LiteralPath (Join-Path $project $JarFile) -Destination (Join-Path $destination 'application.jar')
foreach($folder in @('agent-runtime','vision-runtime/models','deploy/jetson','docs')) {
    New-Item -ItemType Directory -Path (Join-Path $destination $folder) -Force | Out-Null
}
foreach($file in @('package.json','package-lock.json','run.mjs','agriculture-plugin.mjs','tool-scope.mjs','resource-limits.mjs','fast-overview.mjs')) {
    Copy-Item -LiteralPath (Join-Path $project "agent-runtime/$file") -Destination (Join-Path $destination 'agent-runtime')
}
foreach($file in @('infer.py','pipeline.py','backends.py','tensorrt_backend.py','build_engine.py','benchmark.py','validate_backend.py','cuda_preprocess.py','test_cuda_preprocess.py','benchmark_cuda.py')) {
    Copy-Item -LiteralPath (Join-Path $project "vision-runtime/$file") -Destination (Join-Path $destination 'vision-runtime')
}
New-Item -ItemType Directory -Path (Join-Path $destination 'vision-runtime/cuda') -Force | Out-Null
foreach($file in @('CMakeLists.txt','agric_ops.cu')) {
    Copy-Item -LiteralPath (Join-Path $project "vision-runtime/cuda/$file") -Destination (Join-Path $destination 'vision-runtime/cuda')
}
New-Item -ItemType Directory -Path (Join-Path $destination 'embedded/firmware') -Force | Out-Null
Get-ChildItem -LiteralPath (Join-Path $project 'embedded') -File | Where-Object Extension -in '.py','.json','.txt','.md' |
    Copy-Item -Destination (Join-Path $destination 'embedded')
Get-ChildItem -LiteralPath (Join-Path $project 'embedded/firmware') -File |
    Copy-Item -Destination (Join-Path $destination 'embedded/firmware')
foreach($file in @('pear-leaf.onnx','manifest.json','UPSTREAM-LICENSE.txt','ULTRALYTICS-AGPL3.txt')) {
    $source=Join-Path $project "vision-runtime/models/$file"
    if(Test-Path -LiteralPath $source) { Copy-Item -LiteralPath $source -Destination (Join-Path $destination 'vision-runtime/models') }
}
Get-ChildItem -LiteralPath (Join-Path $project 'deploy/jetson') -File -Force | Where-Object Name -ne '.env' |
    Copy-Item -Destination (Join-Path $destination 'deploy/jetson')
foreach($file in @('Jetson部署与验收.md','Jetson串口与CUDA实现及创新点.md','运输车到达与完成回报.md','盐田丰语产品文档.md','代码结构与维护.md','盐田丰语产品文档.docx')) {
    $source=Join-Path $project "docs/$file"
    if(!(Test-Path -LiteralPath $source)) { throw "Required document missing: $file" }
    Copy-Item -LiteralPath $source -Destination (Join-Path $destination 'docs')
}
New-Item -ItemType Directory -Path (Join-Path $destination 'docs/benchmarks') -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $project 'docs/benchmarks/cuda-preprocess-rtx4060.json') -Destination (Join-Path $destination 'docs/benchmarks')
$files=Get-ChildItem -LiteralPath $destination -Recurse -File -Force
if($IncludeMultiCrop) {
    & "$PSScriptRoot/package-multicrop.ps1" -Destination $destination
    $files=Get-ChildItem -LiteralPath $destination -Recurse -File -Force
}
$manifest=$files | ForEach-Object {
    @{path=$_.FullName.Substring($destination.Length+1).Replace([char]92,[char]47);sha256=(Get-FileHash -LiteralPath $_.FullName).Hash.ToLower()}
}
@{version=1;target='jetson-orin-jp6.2.1';files=@($manifest)} | ConvertTo-Json -Depth 5 |
    Set-Content -LiteralPath (Join-Path $destination 'release-manifest.json') -Encoding UTF8
# Explicit children include the hidden .env.example on Windows.
Compress-Archive -LiteralPath @((Get-ChildItem -LiteralPath $destination -Force).FullName) -DestinationPath "$destination.zip"
Write-Host "Jetson release: $destination.zip"
