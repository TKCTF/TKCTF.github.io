import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保publish目录存在
const distDir = 'publish';
const distSrcDir = path.join(distDir, 'src');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

if (!fs.existsSync(distSrcDir)) {
  fs.mkdirSync(distSrcDir, { recursive: true });
}

// 构建配置
const buildOptions = {
  entryPoints: {
    'src/scripts.min': './src/scripts.js',
    'src/styles.min': './src/styles.css'
  },
  bundle: true,
  minify: true,
  sourcemap: false,
  outdir: distDir,
  target: ['es2015'],
  format: 'iife',
  globalName: 'TKCTF',
  // CSS处理
  loader: {
    '.css': 'css'
  },
  // 外部依赖（CDN引入的库）
  external: ['crypto-js']
};

// 构建函数
async function build() {
  try {
    console.log('🚀 开始构建...');
    
    // 使用esbuild构建JS和CSS
    await esbuild.build(buildOptions);
    
    // 复制并修改index.html
    let indexContent = fs.readFileSync('./index.html', 'utf8');
    
    // 修改引用路径 - 现在生成的文件已经包含.min后缀
    indexContent = indexContent.replace(
      'href="./src/styles.css"',
      'href="./src/styles.min.css"'
    );
    indexContent = indexContent.replace(
      'src="./src/scripts.js"',
      'src="./src/scripts.min.js"'
    );
    
    // 写入dist目录
    fs.writeFileSync(path.join(distDir, 'index.html'), indexContent);
    
    // 复制静态资源
    const staticDirs = ['data', 'img', 'sound'];
    staticDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const destDir = path.join(distDir, dir);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        // 复制目录内容
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const srcPath = path.join(dir, file);
          const destPath = path.join(destDir, file);
          if (fs.statSync(srcPath).isFile()) {
            fs.copyFileSync(srcPath, destPath);
          }
        });
      }
    });
    
    // 复制Web Worker文件
    if (fs.existsSync('./src/spectrum-worker.js')) {
      fs.copyFileSync('./src/spectrum-worker.js', path.join(distDir, 'src/spectrum-worker.js'));
    }
    
    // 复制CNAME文件
    if (fs.existsSync('CNAME')) {
      fs.copyFileSync('CNAME', path.join(distDir, 'CNAME'));
    }
    
    console.log('✅ 构建完成！');
    console.log('📁 输出目录: publish/');
    console.log('📄 文件结构:');
    console.log('  ├── index.html');
    console.log('  ├── src/');
    console.log('  │   ├── scripts.min.js');
    console.log('  │   ├── styles.min.css');
    console.log('  │   └── spectrum-worker.js');
    console.log('  ├── data/');
    console.log('  ├── img/');
    console.log('  ├── sound/');
    console.log('  └── CNAME');
    
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

// 监听模式
if (process.argv.includes('--watch')) {
  console.log('👀 启动监听模式...');
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log('监听中... 按 Ctrl+C 退出');
} else {
  build();
}
