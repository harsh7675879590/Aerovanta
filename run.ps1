# AEROVANTA - Start Backend and Frontend concurrently
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   AEROVANTA - Forecast Smarter Procure Better" -ForegroundColor White
Write-Host "   UK Wind Generation Forecast Intelligence Platform" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Python FastAPI backend on port 8000
Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath "python" -ArgumentList "-m uvicorn app.main:app --port 8000 --reload" -WorkingDirectory "$PSScriptRoot\backend" -PassThru

Start-Sleep -Seconds 2

# 2. Start Vite Frontend on port 5173
Write-Host "[2/2] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Set-Location "$PSScriptRoot\frontend"
npm run dev
