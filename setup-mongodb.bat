@echo off
echo Setting up MongoDB for InternQuest...
echo.

echo Option 1: Install MongoDB Community Server
echo 1. Download from: https://www.mongodb.com/try/download/community
echo 2. Install with default settings
echo 3. MongoDB will start automatically as a Windows service
echo.

echo Option 2: Use MongoDB Atlas (Cloud)
echo 1. Go to: https://www.mongodb.com/atlas
echo 2. Create free account and cluster
echo 3. Get connection string and update .env file
echo.

echo Current database configuration:
type backend\.env | findstr MONGODB_URI
echo.

echo After setting up MongoDB, run:
echo   cd backend
echo   npm start
echo.

pause
