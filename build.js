import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================
// 🕒 日志时间戳工具
// =============================
function ts() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `[${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
}
const log = (...args) => console.log(ts(), ...args);
const warn = (...args) => console.warn(ts(), ...args);
const err = (...args) => console.error(ts(), ...args);

// =============================
// 🕘 生成东八区 ISO 8601 时间
// =============================
function formatISO8601Shanghai(date) {
  // 将当前时间转换为上海时区本地时间构件
  const zh = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = zh.getFullYear();
  const MM = pad(zh.getMonth() + 1);
  const dd = pad(zh.getDate());
  const HH = pad(zh.getHours());
  const mm = pad(zh.getMinutes());
  const ss = pad(zh.getSeconds());
  // 上海为固定 +08:00
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}+08:00`;
}

// =============================
// 📁 目录结构
// =============================
const distDir = 'publish';
const distSrcDir = path.join(distDir, 'src');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}
if (!fs.existsSync(distSrcDir)) {
  fs.mkdirSync(distSrcDir, { recursive: true });
}

// =============================
// ⚙️ 构建配置
// =============================
const buildOptions = {
  entryPoints: {
    'src/scripts.min': './src/scripts.js',
    'src/styles.min': './src/styles.css',
    'src/spectrum-worker.min': './src/spectrum-worker.js',
    'src/loading.min': './src/loading.js'
  },
  bundle: true,
  minify: true,
  sourcemap: false,
  outdir: distDir,
  target: ['es2015'],
  format: 'iife',
  globalName: 'TKCTF',
  loader: {
    '.css': 'css',
    '.woff2': 'file',
    '.woff': 'file',
    '.ttf': 'file',
    '.eot': 'file',
    '.otf': 'file'
  },
  external: ['crypto-js'],
  plugins: [
    {
      name: 'post-build',
      setup(build) {
        build.onEnd(() => {
          log('📦 构建完成，复制 HTML & 静态资源...');
          copyStatic();
        });
      }
    }
  ]
};

// =============================
// 🗺 自动生成 sitemap.xml
// =============================
function generateSitemap() {
  let baseUrl = 'https://zjtongji.tkctf.top';
  
  // 尝试从 index.html 的 canonical 标签中提取 URL
  if (fs.existsSync('./index.html')) {
    const indexContent = fs.readFileSync('./index.html', 'utf8');
    const canonicalMatch = indexContent.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
    if (canonicalMatch) {
      baseUrl = canonicalMatch[1].replace(/\/$/, ''); // 移除末尾斜杠
    }
  }
  
  // 生成当前日期（YYYY-MM-DD 格式）
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const lastmod = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  
  // 生成 sitemap.xml 内容
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

</urlset>`;
  
  // 保存到根目录
  fs.writeFileSync('sitemap.xml', sitemapContent, 'utf8');
  log('🗺 sitemap.xml 已自动生成');
  
  return sitemapContent;
}

// =============================
// 📄 复制 HTML + 静态资源
// =============================
function copyStatic() {
  // --- index.html ---
  if (fs.existsSync('./index.html')) {
    let indexContent = fs.readFileSync('./index.html', 'utf8');
    indexContent = indexContent.replace(
      'href="./src/styles.css"',
      'href="./src/styles.min.css"'
    );
    indexContent = indexContent.replace(
      'src="./src/scripts.js"',
      'src="./src/scripts.min.js"'
    );
    indexContent = indexContent.replace(
      'src="./src/loading.js"',
      'src="./src/loading.min.js"'
    );
    // 注入最后构建时间（东八区 ISO 8601），插入到 footer 内部
    const buildISO = formatISO8601Shanghai(new Date());
    // 先移除旧的构建时间段（如果存在）
    indexContent = indexContent.replace(/\s*<p class="build-time">[\s\S]*?<\/p>/, '');
    // 在 </footer> 前插入
    indexContent = indexContent.replace(
      '</footer>',
      `  <p class="build-time" style="font-size:10px;opacity:0.75;margin:2px 0 0;">Latest Build: ${buildISO}</p>\n    </footer>`
    );
    fs.writeFileSync(path.join(distDir, 'index.html'), indexContent);
    log('📄 index.html Footer 最新构建时间已更新');
  }

  // --- 静态资源目录 ---
  const staticDirs = ['data', 'img', 'sound', 'fonts'];
  staticDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const destDir = path.join(distDir, dir);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const srcPath = path.join(dir, file);
        const destPath = path.join(destDir, file);
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
        }
      });

      console.log(`📂 静态资源已同步: ${dir}`);
      // 上一行保留符号与文本一致，这里也输出时间戳
      //（避免重复打印同样一行，保留原样式）
    }
  });

  // --- CNAME ---
  if (fs.existsSync('CNAME')) {
    fs.copyFileSync('CNAME', path.join(distDir, 'CNAME'));
    log('🌐 CNAME 已复制');
  }

  // --- favicon.ico ---
  if (fs.existsSync('favicon.ico')) {
    fs.copyFileSync('favicon.ico', path.join(distDir, 'favicon.ico'));
    log('🖼 favicon.ico 已复制');
  }

  // --- robots.txt ---
  if (fs.existsSync('robots.txt')) {
    fs.copyFileSync('robots.txt', path.join(distDir, 'robots.txt'));
    log('🤖 robots.txt 已复制');
  }

  // --- sitemap.xml ---
  // 复制自动生成的 sitemap.xml（如果存在）
  if (fs.existsSync('sitemap.xml')) {
    fs.copyFileSync('sitemap.xml', path.join(distDir, 'sitemap.xml'));
    log('🗺 sitemap.xml 已复制到输出目录');
  }
}

// =============================
// 🚀 构建函数
// =============================
async function build() {
  try {
    log('🚀 开始构建...');
    // 先生成 sitemap.xml
    generateSitemap();
    await esbuild.build(buildOptions);
    copyStatic();
    printFileTree();
  } catch (error) {
    err('❌ 构建失败:', error);
    process.exit(1);
  }
}

// =============================
// 👀 监听函数
// =============================
async function watch() {
  log('👀 启动监听模式...');
  
  // 初始生成 sitemap.xml
  generateSitemap();

  // esbuild 监听 JS/CSS 改动并输出日志
  const context = await esbuild.context({
    ...buildOptions,
    plugins: [
      ...buildOptions.plugins,
      {
        name: 'watch-logger',
        setup(build) {
          build.onStart(() => {
            log('🔄 检测到 JS/CSS 文件变动，开始重新构建...');
          });
          build.onEnd((result) => {
            if (result.errors.length > 0) {
              err('❌ 构建失败:', result.errors);
            } else {
              log('✅ JS/CSS 构建完成');
            }
          });
        }
      }
    ]
  });
  await context.watch();

  // chokidar 监听 HTML 和 SEO 文件变化
  chokidar.watch(['index.html', 'robots.txt']).on('change', (filePath) => {
    log(`📝 ${filePath} 发生变动，重新生成 sitemap 并复制...`);
    // index.html 变化时重新生成 sitemap（因为可能 URL 变化）
    if (filePath === 'index.html') {
      generateSitemap();
    }
    copyStatic();
  });

  log('监听中... 按 Ctrl+C 退出');
}

// =============================
// 🪵 打印输出目录结构（可选）
// =============================
function printFileTree() {
  log('✅ 构建完成！');
  log('📁 输出目录: publish/');
  log('📄 文件结构:');
  log('  ├── index.html');
  log('  ├── src/');
  log('  │   ├── scripts.min.js');
  log('  │   ├── styles.min.css');
  log('  │   ├── spectrum-worker.min.js');
  log('  │   └── loading.min.js');
  log('  ├── data/');
  log('  ├── img/');
  log('  ├── sound/');
  log('  ├── fonts/');
  log('  ├── CNAME');
  log('  ├── robots.txt');
  log('  └── sitemap.xml');
}

// =============================
// 🏁 入口
// =============================
if (process.argv.includes('--watch')) {
  watch();
} else {
  build();
}
