[CmdletBinding()]
param()
. "$PSScriptRoot/scripts/windows-common.ps1"
try {
    Import-LocalEnvironment
    if (!$env:TEST_DB_URL) {
        Initialize-MySql
        $container = Get-Setting MYSQL_CONTAINER 'agric-mysql'
        $password = Get-Setting DB_PASSWORD 'Root_123456'
        Invoke-Checked docker.exe @('exec', '-e', "MYSQL_PWD=$password", $container, 'mysql', '-uroot', '-e', 'CREATE DATABASE IF NOT EXISTS tianyan_test CHARACTER SET utf8mb4;')
        $port = Get-Setting MYSQL_PORT '3307'
        $env:TEST_DB_URL = "jdbc:mysql://127.0.0.1:${port}/tianyan_test?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true"
        $env:TEST_DB_PASSWORD = $password
    }
    Push-Location $PSScriptRoot
    try { Invoke-Checked "$PSScriptRoot/mvnw.cmd" @('test') } finally { Pop-Location }
} catch { Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red; exit 1 }
