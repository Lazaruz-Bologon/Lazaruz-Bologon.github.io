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
      const level = h[1].length;
      blocks.push(`<h${level}>${renderInline(h[2].trim())}</h${level}>`);
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

function siteShell({ title, subtitle, bodyHtml, description }) {
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
  <script id="fluid-configs">
    var Fluid = window.Fluid || {};
    Fluid.ctx = Object.assign({}, Fluid.ctx)
    var CONFIG = {"hostname":"example.com","root":"/","version":"1.9.8","typing":{"enable":true,"typeSpeed":70,"cursorChar":"_","loop":false,"scope":[]},"anchorjs":{"enable":true,"element":"h1,h2,h3,h4,h5,h6","placement":"left","visible":"hover","icon":""},"progressbar":{"enable":true,"height_px":3,"color":"#29d","options":{"showSpinner":false,"trickleSpeed":100}},"code_language":{"enable":true,"default":"TEXT"},"copy_btn":true,"image_caption":{"enable":true},"image_zoom":{"enable":true,"img_url_replace":["",""]},"toc":{"enable":true,"placement":"right","headingSelector":"h1,h2,h3,h4,h5,h6","collapseDepth":0},"lazyload":{"enable":true,"loading_img":"/img/loading.gif","onlypost":false,"offset_factor":2},"web_analytics":{"enable":false,"follow_dnt":true,"baidu":null,"google":{"measurement_id":null},"tencent":{"sid":null,"cid":null},"leancloud":{"app_id":null,"app_key":null,"server_url":null,"path":"window.location.pathname","ignore_local":false},"umami":{"src":null,"website_id":null,"domains":null,"start_time":"2024-01-01T00:00:00.000Z","token":null,"api_server":null}},"search_path":"/local-search.xml","include_content_in_search":true};
  </script>
  <script src="/js/utils.js"></script>
  <script src="/js/color-schema.js"></script>
  <meta name="generator" content="Hexo 7.3.0">
</head>
<body>
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
              <li class="nav-item"><a class="nav-link" href="#daily-reports" target="_self"><i class="iconfont icon-file-text"></i><span>日报</span></a></li>
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
          <article class="post-content mx-auto">
            <div class="markdown-body">${bodyHtml}</div>
          </article>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`;
}

function renderReportBlock({ date, title, reportDate, bodyHtml }) {
  return `
  <section class="mb-5" id="${escapeHtml(date)}">
    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <h2 class="card-title mb-2">${escapeHtml(reportDate)}</h2>
        <p class="card-text mb-0">论文标题：${escapeHtml(title)}</p>
      </div>
    </div>
    <article class="post-content mx-auto">
      <div class="markdown-body">${bodyHtml}</div>
    </article>
  </section>`;
}

function renderHomePage({ reports }) {
  const latest = reports[0];
  const indexCards = reports
    .map((report) => `<li><a href="#${escapeHtml(report.date)}">${escapeHtml(report.date)}</a> - ${escapeHtml(report.title)}</li>`)
    .join('');
  const blocks = reports.map((report) => renderReportBlock(report)).join('');
  const bodyHtml = `
  <div class="row">
    <div class="col-12 col-lg-10 mx-auto">
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <h2 class="card-title">最新日报</h2>
          <p class="card-text">当前首页直接承载全部日报内容，最新一期是 <a href="#${escapeHtml(latest.date)}">${escapeHtml(latest.reportDate)}</a>。</p>
          <p class="card-text mb-0">下面按日期倒序展示，可在同一页面直接阅读全文。</p>
        </div>
      </div>
      <div class="card shadow-sm mb-4" id="daily-reports">
        <div class="card-body">
          <h2 class="card-title">日报索引</h2>
          <ul>${indexCards}</ul>
        </div>
      </div>
      ${blocks}
    </div>
  </div>`;
  return siteShell({
    title: 'arXiv 医学图像分割日报',
    subtitle: '日报直接展示在首页',
    bodyHtml,
    description: 'arXiv 医学图像分割日报首页，直接展示每日内容与历史记录。',
  });
}

async function writeText(filePath, content) {
  await fs.writeFile(filePath, content, 'utf8');
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
  const homepage = renderHomePage({ reports });
  await writeText(path.join(repoRoot, 'index.html'), homepage);
  await fs.rm(path.join(repoRoot, 'arxiv-daily'), { recursive: true, force: true });

  console.log(`Rendered homepage with ${reports.length} daily report(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
