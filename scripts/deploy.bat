@echo off
REM Event Registration System - Windows Deployment Script

setlocal enabledelayedexpansion

REM Define colors (Windows 10+ with ANSI support)
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "NC=[0m"

:print_header
echo ==================================
echo %BLUE%%~1%NC%
echo ==================================
goto :eof

:print_success
echo %GREEN%✓ %~1%NC%
goto :eof

:print_warning
echo %YELLOW%⚠ %~1%NC%
goto :eof

:print_error
echo %RED%✗ %~1%NC%
goto :eof

:check_docker
call :print_header "Checking Docker Installation"

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Docker is not installed. Please install Docker Desktop first."
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Docker daemon is not running. Please start Docker Desktop first."
    exit /b 1
)

call :print_success "Docker is installed and running"
goto :eof

:deploy
call :print_header "Deploying Event Registration System"

echo Stopping existing containers...
docker-compose down --remove-orphans

echo Building and starting containers...
docker-compose up --build -d

echo Waiting for services to start...
timeout /t 10 /nobreak >nul

call :check_services
goto :eof

:check_services
call :print_header "Checking Service Health"

REM Check MongoDB
docker-compose ps mongodb | findstr "Up" >nul
if %errorlevel% equ 0 (
    call :print_success "MongoDB is running"
) else (
    call :print_error "MongoDB failed to start"
    docker-compose logs mongodb
    exit /b 1
)

REM Check Backend
docker-compose ps backend | findstr "Up" >nul
if %errorlevel% equ 0 (
    call :print_success "Backend API is running"
) else (
    call :print_error "Backend API failed to start"
    docker-compose logs backend
    exit /b 1
)

REM Check Frontend
docker-compose ps frontend | findstr "Up" >nul
if %errorlevel% equ 0 (
    call :print_success "Frontend is running"
) else (
    call :print_error "Frontend failed to start"
    docker-compose logs frontend
    exit /b 1
)

echo Testing API health endpoint...
timeout /t 5 /nobreak >nul

REM Test API endpoint (using curl if available, or powershell)
curl -f http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "API health check passed"
) else (
    call :print_warning "API health check failed - service might still be starting"
)

goto :eof

:show_urls
call :print_header "Application URLs"
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000/api
echo API Health: http://localhost:5000/api/health
echo MongoDB: mongodb://localhost:27017
echo.
call :print_success "Deployment completed successfully!"
echo %YELLOW%Note: It may take a few minutes for all services to be fully ready.%NC%
goto :eof

:view_logs
call :print_header "Viewing Application Logs"
docker-compose logs -f
goto :eof

:stop
call :print_header "Stopping Event Registration System"
docker-compose down
call :print_success "Application stopped"
goto :eof

:cleanup
call :print_header "Cleaning Up Event Registration System"
echo %YELLOW%This will remove all containers, networks, and data volumes!%NC%
set /p "confirm=Are you sure? (y/N): "
if /i "%confirm%" == "y" (
    docker-compose down -v --remove-orphans
    docker system prune -f
    call :print_success "Cleanup completed"
) else (
    echo %YELLOW%Cleanup cancelled%NC%
)
goto :eof

:show_help
echo Event Registration System - Windows Deployment Script
echo.
echo Usage: %~nx0 [COMMAND]
echo.
echo Commands:
echo   deploy    Build and start the application (default)
echo   stop      Stop the application
echo   restart   Restart the application
echo   logs      View application logs
echo   status    Check service status
echo   cleanup   Remove all containers and volumes
echo   help      Show this help message
echo.
echo Examples:
echo   %~nx0 deploy   # Deploy the application
echo   %~nx0 logs     # View logs
echo   %~nx0 stop     # Stop the application
goto :eof

REM Main script logic
if "%~1"=="" set "command=deploy"
if not "%~1"=="" set "command=%~1"

if "%command%"=="deploy" (
    call :check_docker
    call :deploy
    call :show_urls
) else if "%command%"=="stop" (
    call :stop
) else if "%command%"=="restart" (
    call :check_docker
    call :stop
    call :deploy
    call :show_urls
) else if "%command%"=="logs" (
    call :view_logs
) else if "%command%"=="status" (
    call :check_services
) else if "%command%"=="cleanup" (
    call :cleanup
) else if "%command%"=="help" (
    call :show_help
) else if "%command%"=="-h" (
    call :show_help
) else if "%command%"=="--help" (
    call :show_help
) else (
    call :print_error "Unknown command: %command%"
    call :show_help
    exit /b 1
)

endlocal