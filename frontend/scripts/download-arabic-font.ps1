param()

$outDir = "public/fonts"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$candidates = @(
    'https://github.com/alif-type/amiri/raw/master/Amiri-Regular.ttf',
    'https://github.com/alif-type/amiri/raw/master/amiri-fonts/Amiri-Regular.ttf',
    'https://github.com/google/fonts/raw/main/ofl/cairo/Cairo-Regular.ttf',
    'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf'
)

$dest = Join-Path $outDir 'Amiri-Regular.ttf'

Write-Host "Attempting to download an Arabic TTF to $dest"

$success = $false
foreach ($url in $candidates) {
    try {
        Write-Host "Trying: $url"
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -ErrorAction Stop
        Write-Host "Downloaded font from: $url"
        $success = $true
        break
    } catch {
        Write-Host "Failed to download from: $url"
    }
}

if (-not $success) {
    Write-Host "All automatic download attempts failed."
    Write-Host "Please download an Arabic TTF (Amiri, Noto Naskh Arabic, or Cairo) and save it as: $dest"
    exit 1
}

Write-Host "Font placed at: $dest"
exit 0
