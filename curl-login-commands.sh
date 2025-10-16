#!/bin/bash

# ExpenseFlow API Login Commands
# Make sure your server is running on http://localhost:3001

echo "🔐 ExpenseFlow API Login Commands"
echo "=================================="

# Login Command
echo -e "\n📝 Login Command:"
echo "Replace 'your-email@example.com' and 'your-password' with actual credentials"

echo -e "\nBasic Login:"
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'

echo -e "\n\n📋 Login with Pretty Output:"
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com", 
    "password": "your-password"
  }' | python -m json.tool

echo -e "\n\n💾 Login and Save Token (Linux/Mac):"
echo "TOKEN=\$(curl -s -X POST http://localhost:3001/api/auth/login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"email\": \"your-email@example.com\","
echo "    \"password\": \"your-password\""
echo "  }' | grep -o '\"token\":\"[^\"]*\"' | cut -d'\"' -f4)"
echo "echo \$TOKEN"

echo -e "\n\n🔍 Example Test User Login:"
echo "If you have a test user with email: test@example.com and password: test123"
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'

echo -e "\n\n📚 Usage Instructions:"
echo "1. Replace the email and password with your actual credentials"
echo "2. Make sure your ExpenseFlow API server is running on port 3001"
echo "3. Copy the token from the response to use in authenticated requests"
echo "4. Use the token in Authorization header: 'Authorization: Bearer YOUR_TOKEN'"

echo -e "\n\n🚀 Test Authentication with Token:"
echo "# After login, use the token like this:"
echo "curl -X GET http://localhost:3001/api/auth/me \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN_HERE\""
