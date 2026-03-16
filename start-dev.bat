@echo off
echo ========================================
echo   Starting Chat App (Development Mode)
echo ========================================
echo.

echo Starting Backend on http://localhost:5000
start "Chat App - Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend on http://localhost:5173
start "Chat App - Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting MCP Server on http://localhost:6000
start "Chat App - MCP Server" cmd /k "cd mcp-server && npm run dev"

echo.
echo ========================================
echo   All services starting...
echo ========================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   MCP:      http://localhost:6000
echo.
echo   Press any key to exit this window
echo ========================================
pause >nul
