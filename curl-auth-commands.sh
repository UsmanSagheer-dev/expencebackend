# ExpenseFlow Authentication CURL Commands
# Copy and paste these commands in your terminal to test authentication

echo "🚀 ExpenseFlow Authentication CURL Commands"
echo "============================================"

echo ""
echo "1. USER REGISTRATION:"
echo "--------------------"
echo 'curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"test@example.com\",
    \"password\": \"password123\"
  }"'

echo ""
echo "2. USER LOGIN:"
echo "-------------"
echo 'curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"password\": \"password123\"
  }"'

echo ""
echo "3. GET USER PROFILE (Protected Route):"
echo "--------------------------------------"
echo 'curl -X GET http://localhost:3001/api/auth/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"'

echo ""
echo "4. UPDATE PROFILE (Protected Route):"
echo "------------------------------------"
echo 'curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{
    \"name\": \"Updated Test User\"
  }"'

echo ""
echo "5. CHANGE PASSWORD (Protected Route):"
echo "-------------------------------------"
echo 'curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{
    \"currentPassword\": \"password123\",
    \"newPassword\": \"newpassword123\"
  }"'

echo ""
echo "6. LOGOUT (Protected Route):"
echo "----------------------------"
echo 'curl -X POST http://localhost:3001/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"'

echo ""
echo "💡 Instructions:"
echo "1. First run Registration command"
echo "2. Then run Login command and copy the token"
echo "3. Replace 'YOUR_TOKEN_HERE' with actual token in protected routes"
