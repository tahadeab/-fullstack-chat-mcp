@echo off
echo ========================================
echo   Chat App - Setup Script
echo ========================================
echo.

echo [1/4] Setting up Backend...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)
copy .env.example .env 2>nul
echo Generating Prisma client...
call npm run db:generate
cd ..

echo.
echo [2/4] Setting up Frontend...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
copy .env.example .env 2>nul
cd ..

echo.
echo [3/4] Setting up MCP Server...
cd mcp-server
if not exist node_modules (
    echo Installing MCP dependencies...
    call npm install
)
copy .env.example .env 2>nul
cd ..

echo.
echo [4/4] Setup Complete!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo   1. Start PostgreSQL database:
echo      docker run -d --name chatapp-db ^
echo        -e POSTGRES_PASSWORD=postgres ^
echo        -e POSTGRES_DB=chatapp ^
echo        -p 5432:5432 ^
echo        postgres:15-alpine
echo.
echo   2. Run database migrations:
echo      cd backend
echo      npm run db:migrate
echo.
echo   3. Start all services:
echo      - Backend:   cd backend   ^&^& npm run dev
echo      - Frontend:  cd frontend  ^&^& npm run dev
echo      - MCP:       cd mcp-server ^&^& npm run dev
echo.
echo   Or use Docker Compose:
echo      docker-compose up -d
echo.
echo ========================================
pause
