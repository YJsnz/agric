[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$BackupFile,[Parameter(Mandatory=$true)][string]$TargetDatabase,[string]$VisionOutput)
. "$PSScriptRoot/scripts/windows-common.ps1"
Import-LocalEnvironment
Require-Command docker.exe
if ($TargetDatabase -notmatch '^[A-Za-z0-9_]+$') { throw 'TargetDatabase must contain only letters, numbers and underscores.' }
$container = Get-Setting MYSQL_CONTAINER 'agric-mysql'
$password = Get-Setting DB_PASSWORD 'Root_123456'
$backupPath = (Resolve-Path -LiteralPath $BackupFile).Path
$restoreId = [Guid]::NewGuid().ToString('N')
$stage = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "target/restore-staging/$restoreId"))
$remote = "/tmp/agric-restore-$restoreId.sql"
if (!$VisionOutput) { $VisionOutput = Join-Path $PSScriptRoot "var/restored-vision-$restoreId" }
$visionTarget = [IO.Path]::GetFullPath($VisionOutput)
if (Test-Path -LiteralPath $visionTarget) { throw 'VisionOutput must be a new directory to preserve existing files.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead($backupPath)
try {
    foreach ($entry in $archive.Entries) {
        $destination = [IO.Path]::GetFullPath((Join-Path $stage $entry.FullName))
        if (!$destination.StartsWith($stage+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Archive entry is outside the restore directory.' }
    }
} finally { $archive.Dispose() }
Expand-Archive -LiteralPath $backupPath -DestinationPath $stage
$manifest = Get-Content -LiteralPath (Join-Path $stage 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($manifest.schemaVersion -ne 1) { throw 'Unsupported backup version.' }
if (@($manifest.files | Where-Object { $_.path -eq 'database.sql' }).Count -ne 1) { throw 'Database checksum missing.' }
foreach ($file in $manifest.files) {
    $candidate = [IO.Path]::GetFullPath((Join-Path $stage $file.path))
    if (!$candidate.StartsWith($stage+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Backup contains an invalid path.' }
    if (!(Test-Path -LiteralPath $candidate -PathType Leaf) -or (Get-FileHash -LiteralPath $candidate -Algorithm SHA256).Hash -ne $file.sha256) { throw 'Backup integrity check failed.' }
}
if (!(Test-Path -LiteralPath (Join-Path $stage 'database.sql'))) { throw 'Backup SQL missing.' }
$tables = & docker.exe exec -e "MYSQL_PWD=$password" $container mysql -uroot -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$TargetDatabase'"
if ($LASTEXITCODE -ne 0) { throw 'Cannot query target database.' }
if ([int]$tables -gt 0) { throw 'Target database is not empty. Restore into a new database; existing data is never overwritten.' }
Invoke-Checked docker.exe @('exec','-e',"MYSQL_PWD=$password",$container,'mysql','-uroot','-e',"CREATE DATABASE IF NOT EXISTS ``$TargetDatabase`` CHARACTER SET utf8mb4;")
Invoke-Checked docker.exe @('cp',(Join-Path $stage 'database.sql'),"${container}:$remote")
Invoke-Checked docker.exe @('exec','-e',"MYSQL_PWD=$password",$container,'mysql','-uroot',$TargetDatabase,'-e',"source $remote")
if (Test-Path -LiteralPath (Join-Path $stage 'vision')) { Copy-Item -LiteralPath (Join-Path $stage 'vision') -Destination $visionTarget -Recurse }
else { New-Item -ItemType Directory -Path $visionTarget -Force | Out-Null }
Write-Host "Restore complete. Database: $TargetDatabase"
Write-Host "Vision files: $visionTarget"
Write-Host 'Stop the app, set DB_NAME/DB_URL and VISION_STORAGE to the restored locations in .env.local, then restart.'
