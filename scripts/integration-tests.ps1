Param(
    [string]$BaseUrl = $env:PDF_SERVER_URL -or 'http://localhost:3001',
    [string]$ApiKey = $env:PDF_API_KEY
)

Write-Output "Base URL: $BaseUrl"

function Post-JsonToFile($url, $json, $outFile) {
    if ($ApiKey) {
        $headers = @{ Authorization = "Bearer $ApiKey" }
    } else { $headers = @{} }
    Invoke-RestMethod -Uri $url -Method Post -Body ($json | ConvertTo-Json -Depth 10) -ContentType 'application/json' -Headers $headers -OutFile $outFile
}

Write-Output "1) Attachment"
$body = @{ title = 'اختبار'; headers = @('اسم','موقع','ملاحظات'); rows = @( @('A','B','C') ); filename='test-attachment'; response='attachment' }
Invoke-RestMethod -Uri "$BaseUrl/generate-pdf" -Method Post -Body ($body | ConvertTo-Json -Depth 10) -ContentType 'application/json' -OutFile test-attachment.pdf
Write-Output '-> saved test-attachment.pdf'

Write-Output "2) Inline"
$body = @{ title = 'عرض'; headers = @('اسم'); rows = @( @( 'حدود طويلة جدا لتجربة الالتفاف في اللغة العربية والتي تحتاج أن تكسر الأسطر بشكل صحيح' ) ); filename='test-inline'; response='inline' }
Invoke-RestMethod -Uri "$BaseUrl/generate-pdf" -Method Post -Body ($body | ConvertTo-Json -Depth 10) -ContentType 'application/json' -OutFile test-inline.pdf
Write-Output '-> saved test-inline.pdf'

Write-Output "3) Base64"
$body = @{ title = 'base64'; headers = @('H1'); rows = @( @('v1') ); filename='test-base64'; response='base64' }
$resp = Invoke-RestMethod -Uri "$BaseUrl/generate-pdf" -Method Post -Body ($body | ConvertTo-Json -Depth 10) -ContentType 'application/json'
[IO.File]::WriteAllBytes('test-base64.pdf', [Convert]::FromBase64String($resp.content_base64))
Write-Output '-> saved test-base64.pdf'

Write-Output '4) Cache behaviour'
$json = @{ title='cache'; headers=@('H1'); rows=@(@('v1')); filename='test-cache'; response='attachment' } | ConvertTo-Json -Depth 10
$t1 = Measure-Command { Invoke-RestMethod -Uri "$BaseUrl/generate-pdf" -Method Post -Body $json -ContentType 'application/json' | Out-Null }
Start-Sleep -Milliseconds 200
$t2 = Measure-Command { Invoke-RestMethod -Uri "$BaseUrl/generate-pdf" -Method Post -Body $json -ContentType 'application/json' | Out-Null }
Write-Output "First ms: $($t1.TotalMilliseconds), Second ms: $($t2.TotalMilliseconds) (second should be faster if cached)"

Write-Output 'Integration tests completed.'
