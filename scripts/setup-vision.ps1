[CmdletBinding()]
param([switch]$RebuildModel)
$ErrorActionPreference='Stop'
. "$PSScriptRoot/windows-common.ps1"
Push-Location $script:ProjectRoot
try {
    Require-Command py.exe
    $visionPython=Join-Path $script:ProjectRoot 'vision-runtime/.venv/Scripts/python.exe'
    if (!(Test-Path -LiteralPath $visionPython)) { Invoke-Checked py.exe @('-3.11','-m','venv','vision-runtime/.venv') }
    Invoke-Checked $visionPython @('-m','pip','install','-r','vision-runtime/requirements.txt','--disable-pip-version-check')
    $modelPath=Join-Path $script:ProjectRoot 'vision-runtime/models/pear-leaf.onnx'
    if ($RebuildModel -or !(Test-Path -LiteralPath $modelPath) -or !(Test-Path -LiteralPath 'vision-runtime/models/manifest.json')) {
        New-Item -ItemType Directory -Force 'vision-runtime/cache' | Out-Null
        $revision='a435fd29d197dd7bcab016cd86e30f87c1f3ce7c'
        $checkpoint=Join-Path $script:ProjectRoot 'vision-runtime/cache/best.pt'
        $checkpointHash='ffd36dc94e3d242d6f88954a67da73db73fcb038f7500cc01486316148cbf866'
        if (!(Test-Path -LiteralPath $checkpoint) -or (Get-FileHash -LiteralPath $checkpoint -Algorithm SHA256).Hash.ToLower() -ne $checkpointHash) {
            Invoke-WebRequest "https://raw.githubusercontent.com/Wb-az/yolov8-disease-detection-agriculture/$revision/yolov8-pear-experiments/grid-opt/weights/best.pt" -OutFile $checkpoint
        }
        if ((Get-FileHash -LiteralPath $checkpoint -Algorithm SHA256).Hash.ToLower() -ne $checkpointHash) { throw 'Pear checkpoint checksum mismatch.' }
        Invoke-WebRequest "https://raw.githubusercontent.com/Wb-az/yolov8-disease-detection-agriculture/$revision/LICENSE" -OutFile 'vision-runtime/cache/UPSTREAM-LICENSE.txt'
        Invoke-Checked $visionPython @('-m','pip','install','torch==2.13.0','torchvision==0.28.0','--index-url','https://download.pytorch.org/whl/cpu','--disable-pip-version-check')
        Invoke-Checked $visionPython @('-m','pip','install','ultralytics==8.3.203','onnx==1.19.0','onnxscript==0.7.1','dill==0.4.0','--disable-pip-version-check')
        Invoke-Checked $visionPython @('vision-runtime/export_model.py',$checkpoint)
    }
    $manifest=Get-Content 'vision-runtime/models/manifest.json' -Raw -Encoding UTF8 | ConvertFrom-Json
    if ((Get-FileHash -LiteralPath $modelPath -Algorithm SHA256).Hash.ToLower() -ne $manifest.sha256) { throw 'ONNX checksum mismatch. Run setup-vision.ps1 -RebuildModel.' }
    Write-Host 'Pear leaf ONNX model is ready. Inference runs locally on CPU.' -ForegroundColor Green
} finally { Pop-Location }


