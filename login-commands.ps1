# ExpenseFlow API Login Commands (PowerShell)
# Make sure your server is running on http://localhost:3001

Write-Host "🔐 ExpenseFlow API Login Commands" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Basic Login Command
Write-Host "`n📝 Basic Login Command:" -ForegroundColor Yellow
Write-Host "Replace 'your-email@example.com' and 'your-password' with actual credentials" -ForegroundColor Gray

$loginData = @{
    email = "your-email@example.com"
    password = "your-password"
} | ConvertTo-Json

Write-Host "`nPowerShell Command:" -ForegroundColor Cyan
Write-Host "Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -ContentType 'application/json' -Body `$loginData" -ForegroundColor White

# Example with actual execution
Write-Host "`n🚀 Example Login (PowerShell):" -ForegroundColor Yellow
$exampleData = @{
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

Write-Host "# For test user:" -ForegroundColor Gray
Write-Host "`$loginData = @{" -ForegroundColor White
Write-Host "    email = 'test@example.com'" -ForegroundColor White  
Write-Host "    password = 'test123'" -ForegroundColor White
Write-Host "} | ConvertTo-Json" -ForegroundColor White
Write-Host ""
Write-Host "`$response = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -ContentType 'application/json' -Body `$loginData" -ForegroundColor White
Write-Host "`$token = `$response.data.token" -ForegroundColor White
Write-Host "Write-Host `"Token: `$token`"" -ForegroundColor White

# cURL equivalent for Windows
Write-Host "`n📋 cURL Commands for Windows:" -ForegroundColor Yellow

Write-Host "`nBasic Login:" -ForegroundColor Cyan
Write-Host 'curl -X POST http://localhost:3001/api/auth/login ^' -ForegroundColor White
Write-Host '  -H "Content-Type: application/json" ^' -ForegroundColor White
Write-Host '  -d "{\"email\": \"your-email@example.com\", \"password\": \"your-password\"}"' -ForegroundColor White

Write-Host "`nExample Test User Login:" -ForegroundColor Cyan
Write-Host 'curl -X POST http://localhost:3001/api/auth/login ^' -ForegroundColor White
Write-Host '  -H "Content-Type: application/json" ^' -ForegroundColor White  
Write-Host '  -d "{\"email\": \"test@example.com\", \"password\": \"test123\"}"' -ForegroundColor White

Write-Host "`n💾 Save Token to Variable (PowerShell):" -ForegroundColor Yellow
Write-Host '$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -ContentType "application/json" -Body ''{"email": "your-email@example.com", "password": "your-password"}''' -ForegroundColor White
Write-Host '$token = $loginResponse.data.token' -ForegroundColor White
Write-Host 'Write-Host "Your token: $token"' -ForegroundColor White

Write-Host "`n🔍 Test Authentication with Token:" -ForegroundColor Yellow
Write-Host '$headers = @{ "Authorization" = "Bearer $token" }' -ForegroundColor White
Write-Host '$profile = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/me" -Method Get -Headers $headers' -ForegroundColor White
Write-Host '$profile' -ForegroundColor White

Write-Host "`n📚 Usage Instructions:" -ForegroundColor Green
Write-Host "1. Replace the email and password with your actual credentials" -ForegroundColor White
Write-Host "2. Make sure your ExpenseFlow API server is running on port 3001" -ForegroundColor White  
Write-Host "3. Copy the token from the response to use in authenticated requests" -ForegroundColor White
Write-Host "4. Use the token in Authorization header for protected endpoints" -ForegroundColor White
