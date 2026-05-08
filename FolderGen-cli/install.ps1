# ---------------------------------------------------------------------------
# FolderGen Production Installer
# ---------------------------------------------------------------------------

# 1. Elevate to Administrator and stay open on error
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️ Requesting Admin privileges to update System Path..." -ForegroundColor Yellow
    # -NoExit keeps the new window open so you can see the results
    Start-Process powershell.exe "-NoExit -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# 2. Setup Variables
$dir = $PSScriptRoot
if (-not $dir) { $dir = Get-Location }
$exeName = "FolderGen.exe"
$fullExePath = Join-Path $dir $exeName

Write-Host "🌲 FolderGen CLI Installer" -ForegroundColor Cyan
Write-Host "📍 Target Directory: $dir"

# 3. Clean up broken NPM 'Ghost' links that cause MODULE_NOT_FOUND errors
Write-Host "🧹 Checking for conflicting command shims..." -ForegroundColor Gray
$npmGhostPath = "$env:APPDATA\npm\foldergen.cmd"
$npmGhostPathPs = "$env:APPDATA\npm\foldergen.ps1"
$npmGhostNode = "$env:APPDATA\npm\foldergen"

if (Test-Path $npmGhostPath) { Remove-Item $npmGhostPath -Force; Write-Host "   Removed broken .cmd shim" }
if (Test-Path $npmGhostPathPs) { Remove-Item $npmGhostPathPs -Force; Write-Host "   Removed broken .ps1 shim" }
if (Test-Path $npmGhostNode) { Remove-Item $npmGhostNode -Force; Write-Host "   Removed broken node shim" }

# 4. Update the User PATH Registry
try {
    $oldPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($oldPath -split ';' -contains $dir) {
        Write-Host "ℹ️ Folder already exists in User PATH." -ForegroundColor Cyan
    } else {
        $newPath = "$oldPath;$dir"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Host "✅ Registry PATH updated successfully." -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ERROR: Failed to update Registry Path: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Broadcast change to Windows (so other apps see the update)
try {
    $signature = @'
    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, IntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out IntPtr lpdwResult);
'@
    $type = Add-Type -MemberDefinition $signature -Name "Win32" -Namespace "Win32" -PassThru
    $result = [IntPtr]::Zero
    $type::SendMessageTimeout([IntPtr]0xffff, 0x001a, [IntPtr]::Zero, "Environment", 0x02, 5000, [out]$result) | Out-Null
    Write-Host "✅ System environment refresh signaled." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Warning: Could not broadcast environment change. You may need to restart your terminal." -ForegroundColor Yellow
}

# 6. Final verification
if (Test-Path $fullExePath) {
    Write-Host "`n✨ INSTALLATION COMPLETE!" -ForegroundColor Green
    Write-Host "🚀 Try typing 'foldergen' in a new terminal window." -ForegroundColor White
} else {
    Write-Host "`n❌ WARNING: FolderGen.exe was not found in the script directory." -ForegroundColor Red
    Write-Host "   Please ensure this script is in the same folder as your .exe" -ForegroundColor Red
}

Write-Host "`n--------------------------------------------------"
Read-Host "Press ENTER to close this window"