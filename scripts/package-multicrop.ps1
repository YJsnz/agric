param([Parameter(Mandatory=$true)][string]$Destination)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'windows-common.ps1')
$project=$script:ProjectRoot
foreach($folder in @('ai-service','ai-training')) {
    $source=Join-Path $project $folder
    Get-ChildItem -LiteralPath $source -Recurse -File | ForEach-Object {
        $relative=$_.FullName.Substring($project.Length+1).Replace([char]92,[char]47)
        if($relative -match '/(evaluation|reports|tests|__pycache__|\.runtime|\.pytest_cache|\.integration-runtime|\.venv|embedding)/' -or $_.Name.StartsWith('.env')){return}
        if($folder -eq 'ai-training' -and $relative -notmatch '/models/|/weights/'){return}
        if($_.Extension -notin @('.py','.json','.jsonl','.faiss','.pt','.onnx','.cypher','.txt','.md')){return}
        $target=Join-Path $Destination $relative
        New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
        Copy-Item -LiteralPath $_.FullName -Destination $target
    }
}
foreach($file in @('setup-multicrop.ps1','start-multicrop.ps1')){
    Copy-Item -LiteralPath (Join-Path $project $file) -Destination $Destination
}
New-Item -ItemType Directory -Path (Join-Path $Destination 'docs') -Force | Out-Null
Get-ChildItem -LiteralPath (Join-Path $project 'docs') -Filter 'WJM*.md' |
    ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $Destination 'docs') }
