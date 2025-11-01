# OpenAI API Key Setup Script for Windows PowerShell
# Run this script to set up your OpenAI API key

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OpenAI API Key Setup for NeoCare" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if API key is already set
$existingKey = $env:OPENAI_API_KEY
if ($existingKey) {
    Write-Host "✓ OpenAI API key is already set in this session" -ForegroundColor Green
    Write-Host "  Current key: $($existingKey.Substring(0, 7))..." -ForegroundColor Yellow
    Write-Host ""
    $overwrite = Read-Host "Do you want to update it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Keeping existing API key." -ForegroundColor Green
        exit
    }
}

Write-Host "Please enter your OpenAI API key:" -ForegroundColor Yellow
Write-Host "(Get it from: https://platform.openai.com/api-keys)" -ForegroundColor Gray
Write-Host ""

$apiKey = Read-Host "API Key"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "✗ No API key provided. Exiting." -ForegroundColor Red
    exit
}

if (-not $apiKey.StartsWith("sk-")) {
    Write-Host "⚠ Warning: OpenAI API keys usually start with 'sk-'" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}

# Set for current session
$env:OPENAI_API_KEY = $apiKey
Write-Host ""
Write-Host "✓ API key set for current PowerShell session" -ForegroundColor Green

# Ask if user wants to set permanently
Write-Host ""
$permanent = Read-Host "Do you want to set this permanently for your user account? (y/n)"

if ($permanent -eq "y") {
    try {
        [System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', $apiKey, 'User')
        Write-Host "✓ API key set permanently for your user account" -ForegroundColor Green
        Write-Host "  (You may need to restart your terminal/IDE)" -ForegroundColor Yellow
    } catch {
        Write-Host "✗ Failed to set permanent environment variable" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Navigate to ai-services directory:" -ForegroundColor White
Write-Host "   cd ai-services\ai-services" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the AI service:" -ForegroundColor White
Write-Host "   mvn spring-boot:run" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test the configuration:" -ForegroundColor White
Write-Host "   curl http://localhost:8085/api/openai/health" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start your frontend:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup complete! 🚀" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
