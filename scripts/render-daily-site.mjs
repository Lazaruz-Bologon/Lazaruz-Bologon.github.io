import fs from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInline(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function renderMarkdown(lines) {
  const blocks = [];
  let para = [];
  let listItems = [];
  let listType = null;
  let tableLines = [];

  const flushPara = () => {
    if (para.length === 0) return;
    const text = para.join(' ').trim();
    if (text) blocks.push(`<p>${renderInline(text)}</p>`);
    para = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    const tag = listType === 'ol' ? 'ol' : 'ul';
    blocks.push(`<${tag}>`);
    for (const item of listItems) blocks.push(`<li>${renderInline(item)}</li>`);
    blocks.push(`</${tag}>`);
    listItems = [];
    listType = null;
  };

  const flushTable = () => {
    if (tableLines.length === 0) return;
    const rows = [];
    for (const line of tableLines) {
      if (/^\|[-\s:]+\|$/.test(line.trim())) continue;
      rows.push(line.trim().slice(1, -1).split('|').map((cell) => cell.trim()));
    }
    if (rows.length > 0) {
      const [head, ...body] = rows;
      blocks.push('<div class="table-wrap"><table>');
      blocks.push('<thead><tr>');
      for (const cell of head) blocks.push(`<th>${renderInline(cell)}</th>`);
      blocks.push('</tr></thead><tbody>');
      for (const row of body) {
        blocks.push('<tr>');
        for (const cell of row) blocks.push(`<td>${renderInline(cell)}</td>`);
        blocks.push('</tr>');
      }
      blocks.push('</tbody></table></div>');
    }
    tableLines = [];
  };

  for (const line of lines) {
    if (/^\|/.test(line)) {
      flushPara();
      flushList();
      tableLines.push(line);
      continue;
    }

    if (tableLines.length > 0 && !/^\|/.test(line)) flushTable();

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      flushList();
      flushTable();
      blocks.push(`<h${h[1].length}>${renderInline(h[2].trim())}</h${h[1].length}>`);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      flushPara();
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(ordered[1].trim());
      continue;
    }

    const bullet = line.match(/^-+\s+(.*)$/);
    if (bullet) {
      flushPara();
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(bullet[1].trim());
      continue;
    }

    if (!line.trim()) {
      flushPara();
      flushList();
      flushTable();
      continue;
    }

    para.push(line.trim());
  }

  flushPara();
  flushList();
  flushTable();
  return blocks.join('\n');
}

function siteShell({ title, subtitle, bodyHtml, description, bodyClass = '' }) {
  return `<!doctype html>
<html lang="zh-CN" data-default-color-scheme="auto">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, shrink-to-fit=no">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="theme-color" content="#2f4154">
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:locale" content="zh_CN">
  <title>${escapeHtml(title)} - Lazaruz Bologon</title>
  <link rel="apple-touch-icon" sizes="76x76" href="/img/fluid.png">
  <link rel="icon" href="/img/fluid.png">
  <link rel="stylesheet" href="https://lib.baomitu.com/twitter-bootstrap/4.6.1/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://lib.baomitu.com/github-markdown-css/4.0.0/github-markdown.min.css">
  <link rel="stylesheet" href="https://lib.baomitu.com/hint.css/2.7.0/hint.min.css">
  <link rel="stylesheet" href="https://lib.baomitu.com/fancybox/3.5.7/jquery.fancybox.min.css">
  <link rel="stylesheet" href="//at.alicdn.com/t/c/font_1749284_5i9bdhy70f8.css">
  <link rel="stylesheet" href="//at.alicdn.com/t/c/font_1736178_k526ubmyhba.css">
  <link rel="stylesheet" href="/css/main.css">
  <link id="highlight-css" rel="stylesheet" href="/css/highlight.css">
  <link id="highlight-css-dark" rel="stylesheet" href="/css/highlight-dark.css">
  <style>
    .daily-shell { padding: 0.35rem 0 1rem; }
    .daily-shell .daily-title { margin: 1rem 0 0.35rem; font-weight: 700; }
    .daily-shell .daily-subtitle { margin: 0 0 1rem; color: #6c757d; }
    .daily-shell .daily-tree { margin: 0 0 1rem; }
    .daily-shell .daily-tree ul { list-style: none; padding-left: 1.05rem; margin: 0.35rem 0; }
    .daily-shell .daily-tree li { margin: 0.2rem 0; }
    .daily-shell .daily-tree details > summary { cursor: pointer; list-style: none; font-weight: 600; color: #495057; }
    .daily-shell .daily-tree details > summary::-webkit-details-marker { display: none; }
    .daily-shell .daily-day-link { color: #0d6efd; text-decoration: none; }
    .daily-shell .daily-day-link:hover { text-decoration: underline; }
    .daily-shell .daily-page { border-top: 1px solid rgba(0,0,0,.1); padding-top: 1rem; margin-top: 1rem; }
    .daily-shell .daily-page:first-child { border-top: 0; padding-top: 0; margin-top: 0; }
    .daily-shell .daily-page-nav { margin: 0 0 0.35rem; font-size: 0.95rem; }
    .daily-shell .daily-page-nav a { color: #6c757d; text-decoration: none; }
    .daily-shell .daily-page-nav a:hover { text-decoration: underline; }
    .daily-shell .daily-page-meta { margin: 0 0 0.45rem; color: #6c757d; }
    .daily-shell .daily-page-links { margin: 0 0 1rem; color: #6c757d; }
    .daily-shell .daily-page-links a { color: #0d6efd; text-decoration: none; }
    .daily-shell .daily-page-links a:hover { text-decoration: underline; }
    .daily-shell .markdown-body { background: transparent; }
    .daily-shell .markdown-body p,
    .daily-shell .markdown-body li { line-height: 1.78; }
  </style>
  <script id="fluid-configs">
    var Fluid = window.Fluid || {};
    Fluid.ctx = Object.assign({}, Fluid.ctx)
    var CONFIG = {"hostname":"example.com","root":"/","version":"1.9.8","typing":{"enable":true,"typeSpeed":70,"cursorChar":"_","loop":false,"scope":[]},"anchorjs":{"enable":true,"element":"h1,h2,h3,h4,h5,h6","placement":"left","visible":"hover","icon":""},"progressbar":{"enable":true,"height_px":3,"color":"#29d","options":{"showSpinner":false,"trickleSpeed":100}},"code_language":{"enable":true,"default":"TEXT"},"copy_btn":true,"image_caption":{"enable":true},"image_zoom":{"enable":true,"img_url_replace":["",""]},"toc":{"enable":true,"placement":"right","headingSelector":"h1,h2,h3,h4,h5,h6","collapseDepth":0},"lazyload":{"enable":true,"loading_img":"/img/loading.gif","onlypost":false,"offset_factor":2},"web_analytics":{"enable":false,"follow_dnt":true,"baidu":null,"google":{"measurement_id":null},"tencent":{"sid":null,"cid":null},"leancloud":{"app_id":null,"app_key":null,"server_url":null,"path":"window.location.pathname","ignore_local":false},"umami":{"src":null,"website_id":null,"domains":null,"start_time":"2024-01-01T00:00:00.000Z","token":null,"api_server":null}},"search_path":"/local-search.xml","include_content_in_search":true};
  </script>
  <script src="/js/utils.js"></script>
  <script src="/js/color-schema.js"></script>
  <meta name="generator" content="Hexo 7.3.0">
</head>
<body class="${escapeHtml(bodyClass)}">
  <header>
    <div class="header-inner" style="height: 70vh;">
      <nav id="navbar" class="navbar fixed-top navbar-expand-lg navbar-dark scrolling-navbar">
        <div class="container">
          <a class="navbar-brand" href="/">
            <strong>Lazaruz Bologon</strong>
          </a>
          <button id="navbar-toggler-btn" class="navbar-toggler" type="button" data-toggle="collapse"
                  data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                  aria-expanded="false" aria-label="Toggle navigation">
            <div class="animated-icon"><span></span><span></span><span></span></div>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav ml-auto text-center">
              <li class="nav-item"><a class="nav-link" href="/" target="_self"><i class="iconfont icon-home-fill"></i><span>首页</span></a></li>
              <li class="nav-item"><a class="nav-link" href="/archives/" target="_self"><i class="iconfont icon-archive-fill"></i><span>归档</span></a></li>
              <li class="nav-item"><a class="nav-link" href="/categories/" target="_self"><i class="iconfont icon-category-fill"></i><span>分类</span></a></li>
              <li class="nav-item"><a class="nav-link" href="/tags/" target="_self"><i class="iconfont icon-tags-fill"></i><span>标签</span></a></li>
              <li class="nav-item"><a class="nav-link" href="#daily-tree" target="_self"><i class="iconfont icon-file-text"></i><span>日报</span></a></li>
              <li class="nav-item"><a class="nav-link" href="/about/" target="_self"><i class="iconfont icon-user-fill"></i><span>关于</span></a></li>
              <li class="nav-item" id="search-btn"><a class="nav-link" target="_self" href="javascript:;" data-toggle="modal" data-target="#modalSearch" aria-label="Search"><i class="iconfont icon-search"></i></a></li>
              <li class="nav-item" id="color-toggle-btn"><a class="nav-link" target="_self" href="javascript:;" aria-label="Color Toggle"><i class="iconfont icon-dark" id="color-toggle-icon"></i></a></li>
            </ul>
          </div>
        </div>
      </nav>
      <div id="banner" class="banner" parallax="true" style="background: url('/img/default.png') no-repeat center center; background-size: cover;">
        <div class="full-bg-img">
          <div class="mask flex-center" style="background-color: rgba(0, 0, 0, 0.3)">
            <div class="banner-text text-center fade-in-up">
              <div class="h2">
                <span id="subtitle" data-typed-text="${escapeHtml(subtitle)}"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
  <main>
    <div class="container nopadding-x-md">
      <div id="board" style="margin-top: 0">
        <div class="container">
          <div class="daily-shell">${bodyHtml}</div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`;
}

function splitDate(date) {
  const [year, month, day] = date.split('-');
  return { year, month, day };
}

function reportRelPath(date) {
  const { year, month, day } = splitDate(date);
  return `/${year}/${month}/${day}/`;
}

function monthIndexPath(year, month) {
  return `/${year}/${month}/`;
}

function yearIndexPath(year) {
  return `/${year}/`;
}

function renderReportPage(report, nav) {
  const { date, title, reportDate, bodyHtml } = report;
  const { year, month } = splitDate(date);
  return siteShell({
    title: `${reportDate} - arXiv 医学图像分割日报`,
    subtitle: reportDate,
    bodyClass: 'daily-shell',
    description: `arXiv 医学图像分割日报 ${reportDate}`,
    bodyHtml: `
      <div class="daily-page" id="${escapeHtml(date)}">
      <div class="daily-page-nav"><a href="/">${'回到首页'}</a> · <a href="${escapeHtml(yearIndexPath(year))}">${escapeHtml(year)}</a> · <a href="${escapeHtml(monthIndexPath(year, month))}">${escapeHtml(month)} 月</a> · <a href="${escapeHtml(reportRelPath(date))}">本文</a></div>
        <h2 class="daily-title">${escapeHtml(reportDate)}</h2>
        <p class="daily-page-meta">论文标题：${escapeHtml(title)}</p>
        <p class="daily-page-links"><a href="${escapeHtml(monthIndexPath(year, month))}">返回本月目录</a> · <a href="${escapeHtml(yearIndexPath(year))}">返回本年目录</a> · <a href="/">返回首页目录</a></p>
        <div class="markdown-body">${bodyHtml}</div>
      </div>`,
  });
}

function renderIndexPage({ reports }) {
  const grouped = new Map();
  for (const report of reports) {
    const { year, month } = splitDate(report.date);
    if (!grouped.has(year)) grouped.set(year, new Map());
    const months = grouped.get(year);
    if (!months.has(month)) months.set(month, []);
    months.get(month).push(report);
  }

  const years = [...grouped.entries()].map(([year, months]) => {
    const monthItems = [...months.entries()].map(([month, items]) => {
      const days = items.map((item) => `<li><a class="daily-day-link" href="${escapeHtml(reportRelPath(item.date))}">${escapeHtml(item.date)}</a></li>`).join('');
      return `<li><details open><summary>${escapeHtml(month)} 月</summary><ul>${days}</ul></details></li>`;
    }).join('');
    return `<li><details open><summary><a href="${escapeHtml(yearIndexPath(year))}">${escapeHtml(year)}</a></summary><ul>${monthItems}</ul></details></li>`;
  }).join('');

  const latest = reports[0];
  return siteShell({
    title: 'arXiv 医学图像分割日报',
    subtitle: '按年 / 月 / 日浏览日报',
    bodyClass: 'daily-shell',
    description: 'arXiv 医学图像分割日报目录页，按年、月、日组织全部文章。',
    bodyHtml: `
      <h2 class="daily-title">日报目录</h2>
      <p class="daily-subtitle">最新日报：<a href="${escapeHtml(reportRelPath(latest.date))}">${escapeHtml(latest.reportDate)}</a></p>
      <div class="daily-tree" id="daily-tree">
        <ul>${years}</ul>
      </div>`,
  });
}

function renderYearPage(year, months) {
  const monthItems = [...months.entries()].map(([month, items]) => {
    const latest = items[0];
    return `<li><a href="${escapeHtml(monthIndexPath(year, month))}">${escapeHtml(month)} 月</a> · 最新：<a href="${escapeHtml(reportRelPath(latest.date))}">${escapeHtml(latest.reportDate)}</a></li>`;
  }).join('');
  return siteShell({
    title: `${year} 年 - arXiv 医学图像分割日报`,
    subtitle: `${year} 年日报归档`,
    bodyClass: 'daily-shell',
    description: `${year} 年的 arXiv 医学图像分割日报归档页。`,
    bodyHtml: `
      <h2 class="daily-title">${escapeHtml(year)} 年</h2>
      <p class="daily-subtitle"><a href="/">返回目录页</a></p>
      <div class="daily-tree"><ul>${monthItems}</ul></div>`,
  });
}

function renderMonthPage(year, month, items) {
  const dayItems = items.map((item) => `<li><a href="${escapeHtml(reportRelPath(item.date))}">${escapeHtml(item.reportDate)}</a></li>`).join('');
  return siteShell({
    title: `${year}-${month} - arXiv 医学图像分割日报`,
    subtitle: `${year}-${month} 报告列表`,
    bodyClass: 'daily-shell',
    description: `${year}-${month} 的 arXiv 医学图像分割日报列表。`,
    bodyHtml: `
      <h2 class="daily-title">${escapeHtml(year)}-${escapeHtml(month)}</h2>
      <p class="daily-subtitle"><a href="${escapeHtml(yearIndexPath(year))}">返回年目录</a> · <a href="/">返回首页</a></p>
      <div class="daily-tree"><ul>${dayItems}</ul></div>`,
  });
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeText(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf8');
}

async function removeIfExists(target) {
  await fs.rm(target, { recursive: true, force: true });
}

async function loadReports(sourceRoot) {
  const sourceRefRoot = path.join(sourceRoot, 'reference');
  const dates = (await fs.readdir(sourceRefRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));
  if (dates.length === 0) {
    throw new Error(`No dated report folders found under ${sourceRefRoot}`);
  }

  const reports = [];
  for (const date of dates) {
    const sourceMd = path.join(sourceRefRoot, date, 'report.md');
    const md = await fs.readFile(sourceMd, 'utf8');
    const lines = md.split(/\r?\n/);
    const titleMatch = md.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : 'arXiv 医学图像分割日报';
    const dateMatch = md.match(/^日期：(.+)$/m);
    const reportDate = dateMatch ? dateMatch[1].trim() : date;
    const startLine = lines.findIndex((line) => /^##\s+今日筛选结果/.test(line));
    const bodyLines = startLine >= 0 ? lines.slice(startLine) : lines;
    const bodyHtml = renderMarkdown(bodyLines);
    reports.push({ date, title, reportDate, bodyHtml });
  }
  return reports;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceRoot = args.source;
  const repoRoot = args.repo;
  if (!sourceRoot || !repoRoot) {
    throw new Error('Usage: node scripts/render-daily-site.mjs --source <sourceRoot> --repo <repoRoot>');
  }

  const reports = await loadReports(sourceRoot);
  const latest = reports[0];
  const groups = new Map();
  for (const report of reports) {
    const { year, month } = splitDate(report.date);
    if (!groups.has(year)) groups.set(year, new Map());
    const months = groups.get(year);
    if (!months.has(month)) months.set(month, []);
    months.get(month).push(report);
  }

  await writeText(path.join(repoRoot, 'index.html'), renderIndexPage({ reports }));

  for (const [year, months] of groups.entries()) {
    await writeText(path.join(repoRoot, year, 'index.html'), renderYearPage(year, months));
    for (const [month, items] of months.entries()) {
      await writeText(path.join(repoRoot, year, month, 'index.html'), renderMonthPage(year, month, items));
      for (const report of items) {
        const { year: y, month: m, day } = splitDate(report.date);
        const articleDir = path.join(repoRoot, y, m, day);
        await writeText(path.join(articleDir, 'index.html'), renderReportPage(report));
      }
    }
  }

  await writeText(
    path.join(repoRoot, 'README.md'),
    [
      '# arXiv Daily Report',
      '',
      '- Directory structure: `YYYY/MM/DD/index.html`',
      '- Homepage: `/index.html`',
      '- Latest report: `' + reportRelPath(latest.date) + '`',
      '',
      'This repository is populated by the local sync script and mirrored to GitHub Pages.',
      '',
    ].join('\n'),
  );

  console.log(`Rendered ${reports.length} daily report page(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
