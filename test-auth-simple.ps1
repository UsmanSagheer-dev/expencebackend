# ExpenseFlow Authentication Test Script
# Run this in PowerShell to test all authentication endpoints

Write-Host "Testing ExpenseFlow Authentication API" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# 1. Test Registration
Write-Host "`n1. Testing User Registration..." -ForegroundColor Yellow
$registerData = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "Registration successful!" -ForegroundColor Green
    Write-Host $registerResponse.Content
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test Login
Write-Host "`n2. Testing User Login..." -ForegroundColor Yellow
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    $token = $loginResult.data.token
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "Token: $token"
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 3. Test Get Profile
Write-Host "`n3. Testing Get Profile..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $profileResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/me" -Method GET -Headers $headers
    Write-Host "Get profile successful!" -ForegroundColor Green
    Write-Host $profileResponse.Content
} catch {
    Write-Host "Get profile failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAuthentication testing completed!" -ForegroundColor Green
