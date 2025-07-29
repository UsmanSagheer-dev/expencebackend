# ExpenseFlow Authentication Test Script
# Run this in PowerShell to test all authentication endpoints

Write-Host "🚀 Testing ExpenseFlow Authentication API" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# 1. Test Registration
Write-Host "`n1. Testing User Registration..." -ForegroundColor Yellow
$registerData = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host $registerResponse.Content
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
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
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "🔑 Token: $token"
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
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
    Write-Host "✅ Get profile successful!" -ForegroundColor Green
    Write-Host $profileResponse.Content
} catch {
    Write-Host "❌ Get profile failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test Update Profile
Write-Host "`n4. Testing Update Profile..." -ForegroundColor Yellow
$updateData = @{
    name = "Updated Test User"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/profile" -Method PUT -Body $updateData -Headers $headers
    Write-Host "✅ Update profile successful!" -ForegroundColor Green
    Write-Host $updateResponse.Content
} catch {
    Write-Host "❌ Update profile failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test Change Password
Write-Host "`n5. Testing Change Password..." -ForegroundColor Yellow
$passwordData = @{
    currentPassword = "password123"
    newPassword = "newpassword123"
} | ConvertTo-Json

try {
    $passwordResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/change-password" -Method POST -Body $passwordData -Headers $headers
    Write-Host "✅ Change password successful!" -ForegroundColor Green
    Write-Host $passwordResponse.Content
} catch {
    Write-Host "❌ Change password failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Test Logout
Write-Host "`n6. Testing Logout..." -ForegroundColor Yellow
try {
    $logoutResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/logout" -Method POST -Headers $headers
    Write-Host "✅ Logout successful!" -ForegroundColor Green
    Write-Host $logoutResponse.Content
} catch {
    Write-Host "❌ Logout failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Authentication testing completed!" -ForegroundColor Green
