<?php
// Simple script to download an Arabic TTF into public/fonts for dompdf

$fontsDir = __DIR__ . '/../public/fonts';
if (!is_dir($fontsDir)) {
    mkdir($fontsDir, 0755, true);
}

$fontUrl = 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf';
$target = $fontsDir . '/NotoNaskhArabic-Regular.ttf';

echo "Downloading font from: $fontUrl\n";

$ctx = stream_context_create([
    'http' => [
        'timeout' => 30,
        'follow_location' => 1,
        'header' => "User-Agent: PHP-script\r\n",
    ],
]);

$data = @file_get_contents($fontUrl, false, $ctx);
if ($data === false) {
    echo "Failed to download font. Please download manually and place it at: backend/public/fonts/NotoNaskhArabic-Regular.ttf\n";
    exit(1);
}

file_put_contents($target, $data);
echo "Font saved to: $target\n";
echo "Done. Restart your PHP server and retry PDF export.\n";

exit(0);
