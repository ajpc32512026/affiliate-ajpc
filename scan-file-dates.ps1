# Scans a folder (including all subfolders) and lists only the files that were
# modified within the last 7 days.
# Usage: edit $folderPath below if needed, then run this script in PowerShell.

$folderPath = "D:\mysites\affiliate-ajpc"
$cutoffDate = (Get-Date).AddDays(-7)

Get-ChildItem -Path $folderPath -Recurse -File |
    Where-Object { $_.LastWriteTime -ge $cutoffDate } |
    Select-Object FullName, LastWriteTime |
    Sort-Object LastWriteTime -Descending |
    Format-Table -AutoSize

# --- Optional: export the results to a CSV file instead of just printing them ---
# Uncomment the lines below to also save the results as a CSV next to this script.
#
# $csvPath = Join-Path $PSScriptRoot "recently-changed-files.csv"
# Get-ChildItem -Path $folderPath -Recurse -File |
#     Where-Object { $_.LastWriteTime -ge $cutoffDate } |
#     Select-Object FullName, LastWriteTime |
#     Sort-Object LastWriteTime -Descending |
#     Export-Csv -Path $csvPath -NoTypeInformation
# Write-Host "Report saved to: $csvPath"
