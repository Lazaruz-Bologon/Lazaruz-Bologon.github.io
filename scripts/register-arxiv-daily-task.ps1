param(
  [string]$RepoRoot = (Split-Path $PSScriptRoot -Parent),
  [string]$TaskName = 'ArxivDailyReportSync',
  [string]$StartTime = '08:10'
)

$ErrorActionPreference = 'Stop'
$scriptPath = Join-Path $RepoRoot 'scripts\sync-arxiv-daily.ps1'
if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Missing sync script: $scriptPath"
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -Commit"
$trigger = New-ScheduledTaskTrigger -Daily -At ([datetime]::Parse($StartTime))
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -WakeToRun -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Write-Host "Registered scheduled task $TaskName at $StartTime"
