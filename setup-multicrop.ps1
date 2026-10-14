[CmdletBinding()]
param([switch]$InitializeKnowledge)
. "$PSScriptRoot/scripts/windows-common.ps1"
Import-LocalEnvironment
$python=Get-Setting MULTICROP_PYTHON (Join-Path $PSScriptRoot 'vision-runtime/.venv/Scripts/python.exe')
if(!(Test-Path -LiteralPath $python)){throw 'Run setup-vision.ps1 first, or set MULTICROP_PYTHON.'}
Invoke-Checked $python @('-m','pip','install','-r',(Join-Path $PSScriptRoot 'ai-service/integration-requirements.txt'),'--disable-pip-version-check')
if($InitializeKnowledge) {
    Require-Command docker.exe
    $folder=Join-Path $PSScriptRoot 'ai-service/.integration-runtime'
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    $configuration=Join-Path $folder 'runtime.json'
    if(!(Test-Path -LiteralPath $configuration)) {
        # A new release folder can share the existing persistent Neo4j container.
        # Recover its configured credential without printing it or resetting the database.
        $knowledgePassword=$env:NEO4J_PASSWORD
        if(!$knowledgePassword){
            try{
                $priorEnvironment=(& docker.exe inspect agric-multicrop-neo4j --format '{{json .Config.Env}}' 2>$null) | ConvertFrom-Json
                $priorAuth=$priorEnvironment | Where-Object { $_ -like 'NEO4J_AUTH=neo4j/*' } | Select-Object -First 1
                if($priorAuth){$knowledgePassword=$priorAuth.Substring('NEO4J_AUTH=neo4j/'.Length)}
            }catch{}
        }
        if(!$knowledgePassword){
            $bytes=New-Object byte[] 32
            $random=[Security.Cryptography.RandomNumberGenerator]::Create()
            try{$random.GetBytes($bytes)}finally{$random.Dispose()}
            $knowledgePassword=[BitConverter]::ToString($bytes).Replace('-','').ToLower()
        }
        @{password=$knowledgePassword} | ConvertTo-Json | Set-Content -LiteralPath $configuration -Encoding UTF8
    }
    $settings=Get-Content -LiteralPath $configuration -Raw -Encoding UTF8 | ConvertFrom-Json
    $env:NEO4J_PASSWORD=$settings.password
    $env:NEO4J_HTTP_URL='http://127.0.0.1:7474'
    & docker.exe inspect agric-multicrop-neo4j *> $null
    if($LASTEXITCODE -ne 0) {
        Assert-FreePort 7474
        Invoke-Checked docker.exe @('run','-d','--name','agric-multicrop-neo4j','--restart','unless-stopped',
          '-p','127.0.0.1:7474:7474','-e',"NEO4J_AUTH=neo4j/$($settings.password)",
          '-e','NEO4J_server_memory_heap_initial__size=256m','-e','NEO4J_server_memory_heap_max__size=512m',
          '-e','NEO4J_server_memory_pagecache_size=256m','-v','agric-multicrop-neo4j-data:/data','neo4j:5.26-community')
    } else {Invoke-Checked docker.exe @('start','agric-multicrop-neo4j')}
    $ready=$false
    for($attempt=0;$attempt -lt 60;$attempt++){
        try{Invoke-WebRequest 'http://127.0.0.1:7474' -UseBasicParsing -TimeoutSec 2 | Out-Null;$ready=$true;break}catch{Start-Sleep -Seconds 2}
    }
    if(!$ready){throw 'Neo4j startup timeout.'}
    Push-Location $PSScriptRoot
    try{
        if(!(Get-ChildItem 'ai-service/models/embedding' -Filter model_optimized.onnx -Recurse -ErrorAction SilentlyContinue)){
            Invoke-Checked $python @('ai-service/scripts/download_embedding.py')
        }
        # Neural reranking is optional; local edge deployments use the declared lightweight baseline.
        if((Get-Setting MULTICROP_RANKING_MODE 'baseline') -eq 'neural' -and !(Test-Path 'ai-service/models/reranker/manifest.json')){
            Invoke-Checked $python @('ai-service/scripts/download_reranker.py')
        }
        Invoke-Checked $python @('ai-service/initialize_integration.py')
    }finally{Pop-Location}
}
Write-Host 'Multi-crop runtime installed. Start with start-multicrop.ps1.'
