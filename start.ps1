# Sales Memory Agent - Orchestrated Startup Script
# Run this script to spin up the entire application locally!

$ErrorActionPreference = "Stop"
Clear-Host

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SALES MEMORY AGENT - DEV PLATFORM       " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Env Config
$EnvPath = Join-Path (Get-Location) "backend\.env"
if (-not (Test-Path $EnvPath)) {
    Write-Host "[ERROR] backend/.env file not found!" -ForegroundColor Red
    Write-Host "Please create one using backend/.env.example and populate your Hindsight and Groq keys." -ForegroundColor Yellow
    exit 1
}

# Load Env Vars
Get-Content $EnvPath | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
    $name, $value = $_ -split '=', 2
    [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), "Process")
}

$HindsightKey = [System.Environment]::GetEnvironmentVariable("HINDSIGHT_API_KEY")
$GroqKey = [System.Environment]::GetEnvironmentVariable("GROQ_API_KEY")

if ([string]::IsNullOrEmpty($HindsightKey) -or $HindsightKey -eq "your_key_here") {
    Write-Host "[WARN] HINDSIGHT_API_KEY is not set or placeholder in backend/.env!" -ForegroundColor Yellow
}
if ([string]::IsNullOrEmpty($GroqKey) -or $GroqKey -eq "your_key_here") {
    Write-Host "[WARN] GROQ_API_KEY is not set or placeholder in backend/.env!" -ForegroundColor Yellow
}

# 2. Check and Configure Backend Virtual Environment and Dependencies
Write-Host "[INFO] Checking Backend Virtual Environment..." -ForegroundColor Blue
$VenvDir = Join-Path (Get-Location) "backend\.venv"

# Check if uv is available for blazing fast package installs/Python management
$HasUv = $null -ne (Get-Command uv -ErrorAction SilentlyContinue)

if ($HasUv) {
    Write-Host "[SUCCESS] UV detected! Leveraging UV for supercharged Python environment setup." -ForegroundColor Green
    if (-not (Test-Path $VenvDir)) {
        Write-Host "[INFO] Creating virtual environment using UV..." -ForegroundColor DarkGreen
        & uv venv backend\.venv
    }
    $PythonCmd = "$(Join-Path $VenvDir 'Scripts\python.exe')"
} else {
    Write-Host "[INFO] Standard Python detected." -ForegroundColor Yellow
    if (-not (Test-Path $VenvDir)) {
        Write-Host "[INFO] Creating virtual environment..." -ForegroundColor Yellow
        & python -m venv backend\.venv
    }
    $PythonCmd = "$(Join-Path $VenvDir 'Scripts\python.exe')"
}

# Install / update backend dependencies
Write-Host "[INFO] Verifying and Installing Backend Dependencies..." -ForegroundColor Blue
if ($HasUv) {
    & uv pip install -r backend\requirements.txt
} else {
    $PipPath = Join-Path $VenvDir "Scripts\pip.exe"
    & $PipPath install -r backend\requirements.txt
}

# 3. Check Frontend node_modules and setup frontend/.env.local
Write-Host "[INFO] Checking Frontend Configuration..." -ForegroundColor Blue
$FrontendDir = Join-Path (Get-Location) "frontend"
$NodeModulesDir = Join-Path $FrontendDir "node_modules"
$FrontendEnvPath = Join-Path $FrontendDir ".env.local"

if (-not (Test-Path $FrontendEnvPath)) {
    Write-Host "[INFO] Creating frontend/.env.local..." -ForegroundColor DarkCyan
    "VITE_API_URL=http://localhost:8000" | Out-File -FilePath $FrontendEnvPath -Encoding utf8
}

if (-not (Test-Path $NodeModulesDir)) {
    Write-Host "[WARN] npm modules missing. Running npm install (this may take a few moments)..." -ForegroundColor Yellow
    Push-Location $FrontendDir
    & npm install
    Pop-Location
    Write-Host "[SUCCESS] npm modules installed successfully!" -ForegroundColor Green
} else {
    Write-Host "[SUCCESS] npm modules already installed." -ForegroundColor Green
}

# 4. Optional Seeding of Hindsight
Write-Host ""
Write-Host "[?] Would you like to seed the Hindsight Memory Bank with synthetic sales data? (Y/N)" -ForegroundColor Cyan
$SeedChoice = Read-Host
if ($SeedChoice -eq "y" -or $SeedChoice -eq "Y") {
    Write-Host "[INFO] Seeding Hindsight memory bank..." -ForegroundColor Blue
    Push-Location backend
    & $PythonCmd seed.py
    Pop-Location
}

# 5. Launch Backend and Frontend in separate windows
Write-Host ""
Write-Host "[INFO] Launching Sales Memory Agent Services..." -ForegroundColor Cyan

# Prepare Startup Commands
$BackendLaunchArgs = "-NoExit -Command `"cd backend; .venv\Scripts\activate; Write-Host '*** Starting FastAPI Backend Dev Server...' -ForegroundColor Magenta; uvicorn main:app --reload --port 8000`""
$FrontendLaunchArgs = "-NoExit -Command `"cd frontend; Write-Host '*** Starting Vite Frontend Dev Server...' -ForegroundColor Cyan; npm run dev`""

# Launch Backend Window
Write-Host "[INFO] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList $BackendLaunchArgs -WindowStyle Normal

# Launch Frontend Window
Write-Host "[INFO] Starting React/Vite Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList $FrontendLaunchArgs -WindowStyle Normal

Write-Host ""
Write-Host "[SUCCESS] Both backend and frontend services have been launched in separate console windows." -ForegroundColor Green
Write-Host "Enjoy hacking! Close the spawned terminals when you are finished." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
