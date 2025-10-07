# TKCTF 官网

浙江同济科技职业学院信息安全社团官网

## 项目简介

这是一个基于原生 HTML、CSS、JavaScript 构建的现代化社团官网，具有以下特色：

- 🎵 **音频可视化**：点击 LOGO 播放 BGM，支持音频驱动的视觉效果
- 🎨 **科技感设计**：数据流背景、毛玻璃效果、动态光效
- 📱 **响应式布局**：完美适配桌面端和移动端
- 🎯 **交互体验**：平滑滚动、淡入动画、彩蛋功能
- 🔒 **数据加密**：彩蛋内容使用 AES 加密存储

## 技术栈

- **前端**：HTML5、CSS3、JavaScript (ES6+)
- **构建工具**：esbuild
- **加密库**：CryptoJS
- **部署**：GitHub Pages、Cloudflare CDN

## 快速开始

### 环境要求

- Node.js 16+ 
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动监听模式，文件变化时自动重新构建。

### 生产构建

```bash
npm run build
```

构建完成后，所有文件将输出到 `publish/` 目录。

### 部署

将 `publish/` 目录的内容部署到你的 Web 服务器或 GitHub Pages。

## 项目结构

```
TKCTF.github.io/
├── src/                    # 源代码
│   ├── scripts.js         # 主要 JavaScript 逻辑
│   └── styles.css         # 样式文件
├── data/                  # 数据文件
│   ├── members.json       # 成员信息
│   ├── friends.json       # 友链信息
│   └── Card.encrypted     # 加密的卡片内容
├── img/                   # 图片资源
├── sound/                 # 音频文件
├── publish/               # 构建输出目录
├── build.js              # 构建脚本
├── package.json          # 项目配置
└── README.md             # 项目说明
```

## 数据管理

### 成员信息管理 (`data/members.json`)

成员信息分为两个部分：社长信息和社员信息。

#### 社长信息结构

```json
{
  "presidents": {
    "2023": {
      "members": [
        {
          "name": "张三",
          "roles": ["技术负责人", "竞赛负责人"],
          "codeName": "Alpha"
        },
        {
          "name": "李四", 
          "roles": ["行政运营负责人"],
          "codeName": "Beta"
        }
      ],
      "achievements": "主要成就：获得全国信息安全竞赛一等奖"
    },
    "2024": {
      "members": [
        {
          "name": "王五",
          "roles": ["技术负责人/竞赛负责人"],
          "codeName": "Gamma/Delta"
        }
      ],
      "achievements": "主要成就：成功举办校内CTF竞赛"
    }
  }
}
```

#### 社员信息结构

```json
{
  "members": {
    "2023": ["社员1", "社员2", "社员3"],
    "2024": ["社员A", "社员B", "社员C"]
  }
}
```

#### 角色系统说明

**负责人角色**（支持多角色，用 `/` 分隔）：
- `技术负责人` - 蓝色渐变
- `行政运营负责人` - 青色渐变  
- `竞赛负责人` - 橙色渐变
- `宣传负责人` - 粉色渐变

**特殊身份**：
- `平台开发总监` - 紫色渐变，带闪电图标
- `社团新晋指导老师` - 绿色渐变

**代号系统**：
- 支持单个代号：`"codeName": "Alpha"`
- 支持多个代号（用 `/` 分隔）：`"codeName": "Gamma/Delta"`
- 代号会以打字机效果循环显示

#### 添加新成员示例

```json
{
  "presidents": {
    "2025": {
      "members": [
        {
          "name": "新社长",
          "roles": ["技术负责人", "竞赛负责人"],
          "codeName": "NewLeader"
        }
      ],
      "achievements": "主要成就：待补充"
    }
  },
  "members": {
    "2025": ["新社员1", "新社员2"]
  }
}
```

### 友链管理 (`data/friends.json`)

友链数据结构简单，每个友链包含名称和链接：

```json
{
  "friends": [
    {
      "name": "友链名称",
      "url": "https://example.com"
    },
    {
      "name": "另一个友链",
      "url": "https://another.com"
    }
  ]
}
```

#### 添加新友链

```json
{
  "friends": [
    {
      "name": "现有友链",
      "url": "https://existing.com"
    },
    {
      "name": "新友链",
      "url": "https://newlink.com"
    }
  ]
}
```

## 构建配置

### esbuild 配置

项目使用 esbuild 进行构建，主要配置：

- **压缩**：自动压缩 JavaScript 和 CSS
- **打包**：将所有依赖打包成单个文件
- **输出格式**：IIFE（立即执行函数表达式）
- **目标浏览器**：ES2015+

### 构建输出

构建完成后，`publish/` 目录包含：

```
publish/
├── index.html              # 主页面
├── src/
│   ├── scripts.min.js      # 压缩的 JavaScript
│   └── styles.min.css      # 压缩的 CSS
├── data/                   # 数据文件
├── img/                    # 图片资源
├── sound/                  # 音频文件
└── CNAME                   # GitHub Pages 域名配置
```

## 功能特性

### 音频可视化系统

- 点击 LOGO 播放/暂停 BGM
- 音频驱动的 Logo 动画效果
- 频谱可视化显示
- 节拍检测和特效触发

### 响应式设计

- 桌面端：完整功能和视觉效果
- 移动端：优化的触摸交互和性能

### 彩蛋功能

- 滚动到底部触发特殊效果
- 加密卡片内容展示
- 交互式 3D 卡片翻转

## 开发指南

### 添加新功能

1. 在 `src/scripts.js` 中添加功能代码
2. 在 `src/styles.css` 中添加对应样式
3. 运行 `npm run build` 重新构建

### 修改数据

1. 编辑 `data/members.json` 或 `data/friends.json`
2. 运行 `npm run build` 重新构建
3. 部署更新后的 `publish/` 目录

### 加密内容管理

敏感内容存储在 `data/Card.encrypted` 中，使用 AES 加密。如需修改：

1. 解密现有内容
2. 修改内容
3. 重新加密并保存

## 部署说明

### GitHub Pages

1.  `publish` 目录为发布源目录

### 其他服务器

将 `publish/` 目录的内容上传到你的 Web 服务器即可。

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 贡献指南

1. Fork 本仓库
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证

MIT License

## 联系方式

- 项目地址：[https://github.com/TKCTF/TKCTF.github.io](https://github.com/TKCTF/TKCTF.github.io)
- 社团官网：[https://zjtongji.tkctf.top](https://zjtongji.tkctf.top)

---

**注意**：修改项目文件后，请务必运行 `npm run build` 重新构建项目进行发版，这里主要是起到压缩代码提高运行效率的作用。
