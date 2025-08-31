@echo off
echo Setting up Internship Finder MERN Application...
echo.

echo Installing root dependencies...
npm install

echo.
echo Installing backend dependencies...
cd backend
npm install
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo Setup complete!
echo.
echo To start the application:
echo 1. Copy backend\.env.example to backend\.env and configure your environment variables
echo 2. Make sure MongoDB is running
echo 3. Run 'npm run dev' to start both backend and frontend servers
echo.
pause
