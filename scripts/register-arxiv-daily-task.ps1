param(
  [string]$RepoRoot = (Split-Path $PSScriptRoot -Parent),
  [string]$TaskName = 'ArxivDailyReportSync',
  [string]$StartTime
)

$ErrorActionPreference = 'Stop'
$scriptPath = Join-Path $RepoRoot 'scripts\sync-arxiv-daily.ps1'
if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Missing sync script: $scriptPath"
}

if (-not $StartTime) {
  $StartTime = (Get-Date).AddMinutes(1).ToString('HH:mm')
}

$tr = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -Commit"
schtasks /Create /TN $TaskName /SC DAILY /ST $StartTime /TR $tr /F | Out-Null
Write-Host "Registered scheduled task $TaskName starting at $StartTime with daily execution"
