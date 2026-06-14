param(
  [string]$SourceWorkspace = 'E:\zzx\眼底图像分割',
  [string]$RepoRoot = (Split-Path $PSScriptRoot -Parent),
  [switch]$Commit
)

$ErrorActionPreference = 'Stop'
$renderScript = Join-Path $PSScriptRoot 'render-daily-site.mjs'
if (-not (Test-Path -LiteralPath $renderScript)) {
  throw "Missing renderer: $renderScript"
}

node $renderScript --source $SourceWorkspace --repo $RepoRoot

if ($Commit) {
  git -C $RepoRoot add index.html arxiv-daily scripts
  if (-not (git -C $RepoRoot diff --cached --quiet)) {
    git -C $RepoRoot config user.name 'github-actions[bot]'
    git -C $RepoRoot config user.email 'github-actions[bot]@users.noreply.github.com'
    git -C $RepoRoot commit -m 'feat: update daily report site templates'
    git -C $RepoRoot push origin HEAD
  }
}

Write-Host "Synced daily site from $SourceWorkspace"
