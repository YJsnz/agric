[CmdletBinding()]
param([string]$OutputDirectory)
. "$PSScriptRoot/scripts/windows-common.ps1"
Import-LocalEnvironment
Require-Command docker.exe
$container = Get-Setting MYSQL_CONTAINER 'agric-mysql'
$database = Get-Setting DB_NAME 'tianyan'
$password = Get-Setting DB_PASSWORD 'Root_123456'
if ($database -notmatch '^[A-Za-z0-9_]+$') { throw 'Invalid database name.' }
if (!$OutputDirectory) { $OutputDirectory = Join-Path $PSScriptRoot 'backups' }
$outputRoot = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
$backupId = [Guid]::NewGuid().ToString('N')
$stage = Join-Path $PSScriptRoot "target/backup-staging/$backupId"
New-Item -ItemType Directory -Path $stage -Force | Out-Null
$remote = "/tmp/agric-backup-$backupId.sql"
Invoke-Checked docker.exe @('exec','-e',"MYSQL_PWD=$password",$container,'mysqldump','-uroot','--single-transaction','--no-tablespaces','--set-gtid-purged=OFF',"--result-file=$remote",$database)
Invoke-Checked docker.exe @('cp',"${container}:$remote",(Join-Path $stage 'database.sql'))
$vision = Get-Setting VISION_STORAGE (Join-Path $PSScriptRoot 'var/vision')
if (Test-Path -LiteralPath $vision) { Copy-Item -LiteralPath $vision -Destination (Join-Path $stage 'vision') -Recurse }
$files = @(Get-ChildItem -LiteralPath $stage -Recurse -File | ForEach-Object {
    @{path=$_.FullName.Substring($stage.Length+1).Replace('\','/');sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash}
})
@{schemaVersion=1;database=$database;createdAt=[DateTime]::UtcNow.ToString('o');files=$files;mode='software-demo'} | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $stage 'manifest.json') -Encoding UTF8
$destination = Join-Path $outputRoot ("agric-"+(Get-Date -Format 'yyyyMMdd-HHmmss')+"-$backupId.zip")
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $destination
Write-Host "Backup saved: $destination"
Write-Host 'Includes database and vision input files. Passwords, dependencies and model weights are excluded.'
