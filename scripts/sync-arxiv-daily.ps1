param(
  [string]$RepoRoot = (Split-Path $PSScriptRoot -Parent),
  [string]$SourceWorkspace,
  [int]$ReadyDelayMinutes = 5,
  [switch]$Commit
)

$ErrorActionPreference = 'Stop'
$SourceWorkspace = if ($SourceWorkspace) { $SourceWorkspace } else { Split-Path $RepoRoot -Parent }
$renderScript = Join-Path $PSScriptRoot 'render-daily-site.mjs'
if (-not (Test-Path -LiteralPath $renderScript)) {
  throw "Missing renderer: $renderScript"
}

$referenceRoot = Join-Path $SourceWorkspace 'reference'
$readyFiles = Get-ChildItem -Path $referenceRoot -Recurse -File -Filter 'report.ready.json' | Sort-Object LastWriteTime -Descending
if (-not $readyFiles) {
  Write-Host "No ready marker found under $referenceRoot"
  exit 0
}

$readyFile = $readyFiles[0]
$readyData = Get-Content -LiteralPath $readyFile.FullName -Raw | ConvertFrom-Json
$readyAt = [datetimeoffset]::Parse($readyData.readyAt)
$elapsed = [datetimeoffset]::UtcNow - $readyAt.ToUniversalTime()
if ($elapsed.TotalMinutes -lt $ReadyDelayMinutes) {
  $waitMinutes = [math]::Ceiling($ReadyDelayMinutes - $elapsed.TotalMinutes)
  Write-Host "Ready marker found at $($readyData.readyAt), waiting $waitMinutes minute(s) before sync."
  exit 0
}

node $renderScript --source $SourceWorkspace --repo $RepoRoot

if ($Commit) {
  git -C $RepoRoot add index.html 2026 README.md scripts .github\workflows\validate-daily-report.yml
  if (-not (git -C $RepoRoot diff --cached --quiet)) {
    git -C $RepoRoot config user.name 'github-actions[bot]'
    git -C $RepoRoot config user.email 'github-actions[bot]@users.noreply.github.com'
    git -C $RepoRoot commit -m 'feat: update daily report site templates'
    git -C $RepoRoot push origin HEAD
  }
}

Write-Host "Synced daily site from $SourceWorkspace"
