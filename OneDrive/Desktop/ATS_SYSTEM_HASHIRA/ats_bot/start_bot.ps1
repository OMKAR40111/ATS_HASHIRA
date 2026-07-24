Set-Location 'C:\Users\Govin\OneDrive\Desktop\ATS_SYSTEM_HASHIRA\ats_bot'
$tok = [Environment]::GetEnvironmentVariable('TELEGRAM_TOKEN','User')
if ($null -ne $tok -and $tok -ne '') {
    $env:TELEGRAM_TOKEN = $tok
    if (Test-Path .\.venv\Scripts\Activate.ps1) { . .\.venv\Scripts\Activate.ps1 }
    & "C:/Users/Govin/OneDrive/Desktop/ATS_SYSTEM_HASHIRA/ats_bot/.venv/Scripts/python.exe" telegram_bot.py
} else {
    Write-Host 'TELEGRAM_TOKEN not set for user scope'
}
