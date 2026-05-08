# Get the folder where this script is running
$dir = $PSScriptRoot

# Add this folder to the User's PATH variable
$oldPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($oldPath -notlike "*$dir*") {
    $newPath = "$oldPath;$dir"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "✅ FolderGen added to PATH! Restart your terminal to use 'foldergen'." -ForegroundColor Green
} else {
    Write-Host "ℹ️ FolderGen is already in your PATH." -ForegroundColor Cyan
}