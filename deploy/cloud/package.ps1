[CmdletBinding()]
param([string]$OutputDirectory = 'target')

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$outputRoot = Join-Path $projectRoot $OutputDirectory
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$archive = Join-Path $outputRoot "agric-cloud-$timestamp.tar.gz"
$stage = Join-Path ([IO.Path]::GetTempPath()) "agric-cloud-package-$([guid]::NewGuid().ToString('N'))"
$payload = Join-Path $stage 'current'

try {
    $null = New-Item -ItemType Directory -Path $payload,$outputRoot -Force
    $paths = @(& git -C $projectRoot -c core.quotepath=false ls-files --cached --others --exclude-standard)
    if ($LASTEXITCODE -ne 0) { throw 'Unable to list project files with Git.' }

    $included = [System.Collections.Generic.List[string]]::new()
    foreach ($relative in $paths) {
        if (!$relative) { continue }
        if ($relative -match '^deploy/jetson/' -or $relative -match '^tools/') { continue }
        if ($relative -match '^ai-training/' -and $relative -notmatch '^ai-training/[^/]+/models/') { continue }
        $source = Join-Path $projectRoot $relative
        if (!(Test-Path -LiteralPath $source -PathType Leaf)) { continue }
        $destination = Join-Path $payload $relative
        $null = New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force
        Copy-Item -LiteralPath $source -Destination $destination -Force
        $included.Add($relative)
    }

    $modelFiles = @(
        'vision-runtime/models/pear-leaf.onnx',
        'vision-runtime/models/manifest.json',
        'vision-runtime/models/UPSTREAM-LICENSE.txt'
    )
    foreach ($relative in $modelFiles) {
        $source = Join-Path $projectRoot $relative
        if (!(Test-Path -LiteralPath $source -PathType Leaf)) { throw "Required deployment file is missing: $relative" }
        $destination = Join-Path $payload $relative
        $null = New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force
        Copy-Item -LiteralPath $source -Destination $destination -Force
        if (!$included.Contains($relative)) { $included.Add($relative) }
    }

    $commit = (& git -C $projectRoot rev-parse --short HEAD).Trim()
    $manifest = [ordered]@{
        generatedAtUtc = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
        sourceCommit = $commit
        workingTreeIncluded = $true
        fileCount = $included.Count + 1
        ignoredCredentialsIncluded = $false
        requiredVisionModel = 'vision-runtime/models/pear-leaf.onnx'
    }
    $manifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $payload 'deploy/cloud/package-manifest.json') -Encoding utf8

    $tar = Get-Command tar.exe -ErrorAction SilentlyContinue
    if (!$tar) { throw 'tar.exe is required to create the Ubuntu .tar.gz package.' }
    & $tar.Source -czf $archive -C $stage current
    if ($LASTEXITCODE -ne 0) { throw 'tar.exe failed to create the cloud deployment package.' }
    $file = Get-Item -LiteralPath $archive
    Write-Host "Deployment package: $archive"
    Write-Host "Included files: $($included.Count + 1); compressed size: $([math]::Round($file.Length / 1MB, 1)) MB"
} finally {
    if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
}
