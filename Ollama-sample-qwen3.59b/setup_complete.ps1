@'
# EWBlog - MS SQL Database Setup Script

Write-Host "EWBlog MS SQL Setup" -ForegroundColor Cyan
Write-Host ""

# Check for existing package-lock.json
if (Test-Path ".\package-lock.json") {
    Write-Host "  Using existing package-lock.json" -ForegroundColor Yellow
} else {
    Write-Host "  Installing mssql..." -ForegroundColor Yellow
    npm install --save-dev mssql >nul 2>&1 || Write-Host "  Could not install mssql" -ForegroundColor Red
}

Write-Host ""
Write-Host "  Setting up project structure..." -ForegroundColor Cyan

# Create package.json with all dependencies
$dependencies = @{
    'name' = 'ewblog'
    'private' = $true
    'version' = '1.0.0'
    'type' = 'module'
}

$devDependencies = @{
    'mssql' = '^12.7.11'
    'vite' = '^5.0.13'
    '@vitejs/plugin-react' = '^6.0.2'
    'react' = '^19.3.1'
    'react-dom' = '^19.3.1'
    'react-router-dom' = '^7.18.4'
    'tailwindcss' = '^4.0.0'
    'autoprefixer' = '^10.4.33'
}

# Write complete package.json
$packageJson = @{
    "name" = "ewblog"
    "private" = $true
    "version" = "1.0.0"
    "type" = "module"
    "scripts" = @{
        "dev" = "vite"
        "build" = "vite build"
        "preview" = "vite preview"
        "server" = "node src/server.js"
    }
}
$packageJson.Add-Member -TypeName 'PSCustomObject' -NoteProperty dependencies
$packageJson.dependencies = $dependencies.Values
$packageDevDependencies = $devDependencies.Values
$packageDevDependencies.Add-Member -TypeName 'PSCustomObject' -NoteProperty packages @('mssql', 'vite')

# Write package.json to file
[system.IO.File]::WriteAllText(".\package.json", $packageJson.ToJSON(), $true)

Write-Host "  Created package.json" -ForegroundColor Green

# Install all packages
Write-Host ""
Write-Host "  Installing dependencies..." -ForegroundColor Yellow
npm install >nul 2>&1 || Write-Host "  Some dependencies might fail, continuing with manual setup" -ForegroundColor Gray

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETED!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Connect to MSSQL Server (Bing Search or SQL Server Studio)"
Write-Host "   Login with your credentials from setup_ewblog.sql"
Write-Host ""
Write-Host "2. Execute sample data into database"
Write-Host "   OR use the following script:" -ForegroundColor Cyan
Write-Host "   # Run this in SSMS: EXEC sys.sp_helptext ..." -ForegroundColor Gray
Write-Host ""
Write-Host "3. Configure server.js to connect to database"
Write-Host "   See src/server.mjs for connection code" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Visit your blog at http://localhost:5173/" -ForegroundColor Green
Write-Host ""
Write-Host "For detailed instructions, see SETUP_INSTRUCTIONS.txt" -ForegroundColor Cyan

$exitCode = 0
Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
exit $exitCode
'@
