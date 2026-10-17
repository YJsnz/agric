$ErrorActionPreference = 'Stop'
$script:ProjectRoot = if ((Split-Path (Resolve-Path $PSScriptRoot).Path -Leaf) -eq 'scripts') {
    Split-Path $PSScriptRoot -Parent
} else {
    $PSScriptRoot
}

function Import-LocalEnvironment {
    $path = Join-Path $script:ProjectRoot '.env.local'
    if (!(Test-Path -LiteralPath $path)) { return }
    foreach ($line in [IO.File]::ReadAllLines($path)) {
        $value = $line.Trim()
        if (!$value -or $value.StartsWith('#')) { continue }
        if ($value -notmatch '^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') {
            throw "Invalid .env.local line: expected KEY=VALUE."
        }
        $name = $Matches[1]
        $value = $Matches[2].Trim()
        if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

function Get-Setting($Name, $Default) {
    $value = [Environment]::GetEnvironmentVariable($Name, 'Process')
    if ([string]::IsNullOrWhiteSpace($value)) { return $Default }
    return $value
}

function Require-Command($Name) {
    if (!(Get-Command $Name -ErrorAction SilentlyContinue)) { throw "Missing $Name. See docs/windows.md for installation instructions." }
}

function Assert-FreePort($Port) {
    $number = 0
    if (![int]::TryParse([string]$Port, [ref]$number) -or $number -lt 1 -or $number -gt 65535) { throw "Invalid port: $Port" }
    $listener = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $number)
    try { $listener.Start() } catch { throw "Port $Port is occupied. Stop the existing service or choose another port." } finally { $listener.Stop() }
}

function Invoke-Checked($Command, [string[]]$Arguments) {
    $ErrorActionPreference = 'Continue' # Windows PowerShell 5.1 treats native stderr as ErrorRecord.
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$Command failed (exit $LASTEXITCODE)." }
}

function Initialize-MySql {
    $ErrorActionPreference = 'Continue'
    Require-Command docker.exe
    & docker.exe info *> $null
    if ($LASTEXITCODE -ne 0) { throw 'Start Docker Desktop and wait for the Linux engine to be ready.' }
    $container = Get-Setting MYSQL_CONTAINER 'agric-mysql'
    $password = Get-Setting DB_PASSWORD 'Root_123456'
    $database = Get-Setting DB_NAME 'tianyan'
    $port = Get-Setting MYSQL_PORT '3307'
    if ($database -notmatch '^[A-Za-z0-9_]+$') { throw 'DB_NAME must contain only letters, numbers and underscores.' }
    & docker.exe inspect $container *> $null
    if ($LASTEXITCODE -ne 0) {
        Assert-FreePort $port
        Write-Host "Creating MySQL container: $container"
        Invoke-Checked docker.exe @('run', '-d', '--name', $container, '--restart', 'unless-stopped', '-p', "127.0.0.1:${port}:3306", '-e', "MYSQL_ROOT_PASSWORD=$password", '-e', "MYSQL_DATABASE=$database", '-v', "$(Get-Setting MYSQL_VOLUME 'agric-mysql-data'):/var/lib/mysql", (Get-Setting MYSQL_IMAGE 'mysql:8.4'))
    } else {
        $details = (& docker.exe inspect $container | Out-String | ConvertFrom-Json)[0]
        $bindings = $details.HostConfig.PortBindings.'3306/tcp'
        if (!$bindings -or $bindings[0].HostPort -ne $port) { throw "Container $container does not map MySQL to port $port. Set MYSQL_PORT to its actual port or choose a new MYSQL_CONTAINER." }
        $running = & docker.exe inspect -f '{{.State.Running}}' $container
        if ($running -ne 'true') { Invoke-Checked docker.exe @('start', $container) }
    }
    Write-Host 'Waiting for MySQL (up to 120 seconds)...'
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        & docker.exe exec -e "MYSQL_PWD=$password" $container mysql -uroot -N -e 'SELECT 1' *> $null
        if ($LASTEXITCODE -eq 0) {
            Invoke-Checked docker.exe @('exec', '-e', "MYSQL_PWD=$password", $container, 'mysql', '-uroot', '-e', "CREATE DATABASE IF NOT EXISTS ``$database`` CHARACTER SET utf8mb4;")
            if (!$env:DB_URL) { $env:DB_URL = "jdbc:mysql://127.0.0.1:${port}/${database}?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true" }
            return
        }
        Start-Sleep -Seconds 2
    }
    throw "MySQL authentication/readiness failed. Check DB_PASSWORD and run: docker logs $container --tail 50"
}
