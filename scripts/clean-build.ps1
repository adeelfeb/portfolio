# Clean Next.js build cache and artifacts
Write-Host "Cleaning Next.js build cache..." -ForegroundColor Yellow

# Remove .next directory
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Removed .next directory" -ForegroundColor Green
} else {
    Write-Host "✓ .next directory not found" -ForegroundColor Gray
}

# Remove node_modules/.cache if it exists
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✓ Removed node_modules/.cache" -ForegroundColor Green
}

# Remove any build artifacts
if (Test-Path "out") {
    Remove-Item -Recurse -Force "out"
    Write-Host "✓ Removed out directory" -ForegroundColor Green
}

Write-Host "`nBuild cache cleaned successfully!" -ForegroundColor Green
Write-Host "You can now run 'npm run dev' or 'npm run build' again." -ForegroundColor Cyan
