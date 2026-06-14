param(
  [string]$SourceWorkspace = 'E:\zzx\眼底图像分割',
  [string]$RepoRoot = (Split-Path $PSScriptRoot -Parent),
  [switch]$Commit
)

$ErrorActionPreference = 'Stop'

function Write-Utf8File {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][object[]]$Lines
  )
  $text = ($Lines -join [Environment]::NewLine) + [Environment]::NewLine
  [System.IO.File]::WriteAllText($Path, $text, [System.Text.UTF8Encoding]::new($false))
}

function Read-Utf8File {
  param([Parameter(Mandatory = $true)][string]$Path)
  return [System.IO.File]::ReadAllText($Path, [System.Text.UTF8Encoding]::new($false))
}

$sourceRefRoot = Join-Path $SourceWorkspace 'reference'
if (-not (Test-Path -LiteralPath $sourceRefRoot)) { throw "Source reference root not found: $sourceRefRoot" }

$dateDirs = Get-ChildItem -LiteralPath $sourceRefRoot -Directory |
  Where-Object { $_.Name -match '^\d{4}-\d{2}-\d{2}$' } |
  Sort-Object Name

if (-not $dateDirs) { throw "No dated report folders found under $sourceRefRoot" }

$latestDate = $dateDirs[-1].Name
$dailyRoot = Join-Path $RepoRoot 'arxiv-daily'
$latestRoot = Join-Path $dailyRoot 'latest'
$archiveRoot = Join-Path $dailyRoot 'archive'
foreach ($dir in @($dailyRoot, $latestRoot, $archiveRoot)) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

foreach ($dateDir in $dateDirs) {
  $date = $dateDir.Name
  $sourceDir = Join-Path $sourceRefRoot $date
  $sourceMd = Join-Path $sourceDir 'report.md'
  $sourceHtml = Join-Path $sourceDir 'report.html'
  if (-not (Test-Path -LiteralPath $sourceMd)) { throw "Missing report.md: $sourceMd" }
  if (-not (Test-Path -LiteralPath $sourceHtml)) { throw "Missing report.html: $sourceHtml" }
  $archiveDir = Join-Path $archiveRoot $date
  New-Item -ItemType Directory -Force -Path $archiveDir | Out-Null
  Copy-Item -LiteralPath $sourceMd -Destination (Join-Path $archiveDir 'report.md') -Force
  Copy-Item -LiteralPath $sourceHtml -Destination (Join-Path $archiveDir 'report.html') -Force
  if ($date -eq $latestDate) {
    Copy-Item -LiteralPath $sourceMd -Destination (Join-Path $latestRoot 'report.md') -Force
    Copy-Item -LiteralPath $sourceHtml -Destination (Join-Path $latestRoot 'report.html') -Force
  }
}

$latestIndex = @(
  '<!doctype html>',
  '<html lang="zh-CN">',
  '<head>',
  '<meta charset="utf-8" />',
  '<meta name="viewport" content="width=device-width, initial-scale=1" />',
  '<meta http-equiv="refresh" content="0; url=/arxiv-daily/latest/report.html" />',
  '<title>arXiv 医学图像分割日报</title>',
  '<style>',
  'body{margin:0;font-family:"Microsoft YaHei",sans-serif;background:linear-gradient(135deg,#0f172a,#123b66 48%,#0f766e);color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}',
  '.card{max-width:860px;background:rgba(255,255,255,.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.18);border-radius:20px;padding:28px 30px;box-shadow:0 24px 60px rgba(0,0,0,.18)}',
  'h1{margin:0 0 10px;font-size:30px}p{line-height:1.75;margin:10px 0}a{color:#c7f9ff}',
  '</style>',
  '</head>',
  '<body>',
  '<div class="card">',
  '  <h1>arXiv 医学图像分割日报</h1>',
  '  <p>最新日报：<a href="/arxiv-daily/latest/report.html">/arxiv-daily/latest/report.html</a></p>',
  '  <p>归档目录：<a href="/arxiv-daily/archive/">/arxiv-daily/archive/</a></p>',
  '  <p>当前页面会自动跳转到最新日报。若未跳转，可直接点击上面的链接。</p>',
  '</div>',
  '</body>',
  '</html>'
)
Write-Utf8File -Path (Join-Path $dailyRoot 'index.html') -Lines $latestIndex

$latestFolderIndex = @(
  '<!doctype html>',
  '<html lang="zh-CN">',
  '<head>',
  '<meta charset="utf-8" />',
  '<meta http-equiv="refresh" content="0; url=/arxiv-daily/latest/report.html" />',
  '<title>arXiv 医学图像分割日报</title>',
  '</head>',
  '<body>',
  '  <p><a href="/arxiv-daily/latest/report.html">如果没有自动跳转，请点击这里</a></p>',
  '</body>',
  '</html>'
)
Write-Utf8File -Path (Join-Path $latestRoot 'index.html') -Lines $latestFolderIndex

$archiveDates = @($dateDirs | ForEach-Object { $_.Name })
$archiveIndex = @(
  '<!doctype html>',
  '<html lang="zh-CN">',
  '<head>',
  '<meta charset="utf-8" />',
  '<meta name="viewport" content="width=device-width, initial-scale=1" />',
  '<title>arXiv 医学图像分割日报归档</title>',
  '<style>',
  'body{margin:0;font-family:"Microsoft YaHei",sans-serif;background:#f4f7fb;color:#142033;line-height:1.7}',
  'main{max-width:960px;margin:0 auto;padding:32px 18px 56px}',
  'h1{margin:0 0 10px}p{margin:8px 0 16px}.card{background:#fff;border:1px solid #d7e0ea;border-radius:16px;padding:18px 20px;box-shadow:0 10px 30px rgba(15,23,42,.06)}ul{margin:12px 0 0 22px}li{margin:8px 0}a{color:#1d4ed8;text-decoration:none}a:hover{text-decoration:underline}',
  '</style>',
  '</head>',
  '<body>',
  '<main>',
  '  <h1>arXiv 医学图像分割日报归档</h1>',
  '  <p>下面列出所有已同步的日报日期，最新版本位于 <a href="/arxiv-daily/latest/report.html">/arxiv-daily/latest/report.html</a>。</p>',
  '  <div class="card">',
  '    <ul>'
)
foreach ($date in ($archiveDates | Sort-Object -Descending)) {
  $archiveIndex += '      <li><a href="/arxiv-daily/archive/' + $date + '/report.html">' + $date + '</a></li>'
}
$archiveIndex += @(
  '    </ul>',
  '  </div>',
  '</main>',
  '</body>',
  '</html>'
)
Write-Utf8File -Path (Join-Path $archiveRoot 'index.html') -Lines $archiveIndex

$readme = @(
  '# arXiv Daily Report',
  '',
  '- Latest report: [latest/report.html](/arxiv-daily/latest/report.html)',
  '- Archive index: [archive/index.html](/arxiv-daily/archive/)',
  '- Source workspace: `E:\zzx\眼底图像分割`',
  '- Sync source folders: `E:\zzx\眼底图像分割\reference\YYYY-MM-DD\`',
  '- One-time task registration: `powershell -ExecutionPolicy Bypass -File scripts\\register-arxiv-daily-task.ps1`',
  '',
  'This folder is populated by the local sync script and mirrored to GitHub Pages.'
)
Write-Utf8File -Path (Join-Path $dailyRoot 'README.md') -Lines $readme

$rootIndexPath = Join-Path $RepoRoot 'index.html'
$rootIndex = Read-Utf8File -Path $rootIndexPath
if ($rootIndex -notmatch '/arxiv-daily/') {
  $oldNav = @(
    '            <li class="nav-item">',
    '              <a class="nav-link" href="/about/" target="_self">'
  ) -join [Environment]::NewLine
  $newNav = @(
    '            <li class="nav-item">',
    '              <a class="nav-link" href="/arxiv-daily/" target="_self">',
    '                <i class="iconfont icon-file-text"></i>',
    '                <span>日报</span>',
    '              </a>',
    '            </li>',
    '',
    '            <li class="nav-item">',
    '              <a class="nav-link" href="/about/" target="_self">'
  ) -join [Environment]::NewLine
  if ($rootIndex.Contains($oldNav)) {
    $rootIndex = $rootIndex.Replace($oldNav, $newNav)
    Write-Utf8File -Path $rootIndexPath -Lines @($rootIndex -split '\r?\n')
  }
}

if ($Commit) {
  git -C $RepoRoot add index.html arxiv-daily
  if (-not (git -C $RepoRoot diff --cached --quiet)) {
    git -C $RepoRoot config user.name 'github-actions[bot]'
    git -C $RepoRoot config user.email 'github-actions[bot]@users.noreply.github.com'
    git -C $RepoRoot commit -m 'feat: add daily arxiv report sync'
    git -C $RepoRoot push origin HEAD
  }
}

Write-Host "Synced latest report $latestDate"
Write-Host "Daily pages written under $dailyRoot"

