[CmdletBinding()]
param()
. "$PSScriptRoot/scripts/windows-common.ps1"
try { Import-LocalEnvironment; Initialize-MySql; Write-Host 'MySQL is ready. Run start.cmd next.' }
catch { Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red; exit 1 }
