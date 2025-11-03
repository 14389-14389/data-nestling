$content = Get-Content -Raw .env
Write-Host "Raw content:"
$content
Write-Host "Characters:"
[System.Text.Encoding]::UTF8.GetBytes($content) | ForEach-Object { "{0:X2}" -f $_ }
Write-Host "String length: $($content.Length)"
