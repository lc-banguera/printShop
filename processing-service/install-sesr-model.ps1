$ErrorActionPreference = 'Stop'

$serviceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$modelsDir = Join-Path $serviceRoot 'models'
$destination = Join-Path $modelsDir 'SESR_int8.onnx'
$temporary = Join-Path $modelsDir 'SESR_int8.onnx.download'
$url = 'https://huggingface.co/amd/sesr/resolve/main/SESR_int8.onnx'
$expectedSha256 = 'd76ccb210397bca910c224172a54a12c0b0cc5bcb8573b317f0df758c265b093'

New-Item -ItemType Directory -Force -Path $modelsDir | Out-Null
try {
    Invoke-WebRequest -Uri $url -OutFile $temporary
    $actualSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $temporary).Hash.ToLowerInvariant()
    if ($actualSha256 -ne $expectedSha256) {
        throw "SESR checksum mismatch. Expected $expectedSha256 but received $actualSha256."
    }
    Move-Item -Force -LiteralPath $temporary -Destination $destination
    Write-Output "Installed SESR model at $destination"
    Write-Output "SHA256: $actualSha256"
}
finally {
    if (Test-Path -LiteralPath $temporary) {
        Remove-Item -Force -LiteralPath $temporary
    }
}
