# 毕业祝福墙

同窗数载，情谊长存。为即将远行的 TA，留下最真挚的毕业祝福。

毕业祝福墙是一个实时互动的 Web 应用，同学们可以扫码写下祝福、上传照片，祝福会实时在大屏幕上滚动展示，配合烟花动效，营造温馨的毕业氛围。

## 功能预览

| 页面 | 说明 |
|------|------|
| 首页 | 展示三个入口：大屏幕、写祝福、二维码 |
| /submit | 提交祝福页 — 输入姓名、留言、上传照片、选择学位服颜色和贴纸 |
| /screen | 大屏幕展示页 — 祝福卡片实时滚动，新祝福自动弹出并放烟花 |
| /qr | 二维码页 — 展示扫码参与链接，方便投影到大屏幕 |

## 技术栈

- **前端**：Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
- **动画**：GSAP + canvas-confetti
- **实时数据**：Firebase Realtime Database
- **部署**：Node.js 服务器（pm2 + nginx）或 Cloudflare Pages

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/2924205056/graduation-blessing.git
cd graduation-blessing
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Firebase

在 [Firebase Console](https://console.firebase.google.com) 创建项目，开启 Realtime Database，然后在项目根目录创建 `.env.local`：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=你的_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=你的项目.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=你的项目id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=你的项目.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=你的sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=你的app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://你的项目.firebaseio.com
```

> Firebase Realtime Database 规则建议设为公开读写（仅用于活动场景）：
> ```json
> { "rules": { ".read": true, ".write": true } }
> ```

### 4. 启动开发服务器

```bash
npm run dev
```

浏览器打开 http://localhost:3000 即可预览。

## 部署

### 方式一：云服务器部署（推荐国内用户）

适合香港/海外轻量云服务器，国内访问稳定，免备案。

```bash
# 在服务器上执行（Ubuntu 22.04，需 root）
git clone https://github.com/2924205056/graduation-blessing.git
cd graduation-blessing
bash deploy.sh
```

部署脚本会自动完成：
- 安装 Node.js 20 + pm2 + nginx
- 安装依赖并构建
- 交互式引导填写 Firebase 配置
- pm2 启动应用（开机自启）
- 配置 nginx 反向代理 + HTTPS 证书（Let's Encrypt）

推荐配置：2核2G 起步，腾讯云/阿里云香港轻量服务器。

### 方式二：Cloudflare Pages 部署

```bash
npm run build:cf
```

需要在 Cloudflare Dashboard 中配置环境变量，并绑定 KV 命名空间。

### 更新部署

```bash
cd /opt/graduation-blessing
git pull
npm install
npm run build
pm2 restart graduation-blessing
```

## 项目结构

```
graduation-blessing/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 首页
│   │   ├── layout.tsx        # 全局布局
│   │   ├── submit/page.tsx   # 提交祝福
│   │   ├── screen/page.tsx   # 大屏幕展示
│   │   ├── qr/page.tsx       # 二维码页
│   │   └── api/
│   │       └── blessings/
│   │           └── route.ts  # 祝福 API
│   ├── lib/
│   │   ├── firebase.ts       # Firebase 初始化
│   │   ├── blessings.ts      # 祝福数据读写
│   │   ├── sound.ts          # 提示音效
│   │   └── flowers.ts        # 花束/贴纸素材
│   └── types/
│       └── blessing.ts       # 祝福数据类型
├── public/                   # 静态资源
├── deploy.sh                 # 一键部署脚本
├── ecosystem.config.js       # pm2 配置
└── next.config.ts            # Next.js 配置
```

## 常用命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产包（Node.js 服务器）
npm run build:cf   # 构建 Cloudflare Pages 包
npm run start      # 启动生产服务器
npm run lint       # 代码检查
```

## 常见问题

**Q: 提交祝福后大屏幕没有实时更新？**
A: 检查 Firebase Realtime Database 是否正确配置，确认 `.env.local` 中的 `NEXT_PUBLIC_FIREBASE_DATABASE_URL` 填写正确。

**Q: 国内访问速度慢？**
A: 推荐使用香港地域的云服务器，nginx 开启 gzip 压缩和静态资源缓存可以显著提升体验。

**Q: 照片上传失败？**
A: 如需使用图片上传功能，需要在 Firebase Console 中开启 Storage 并配置相应规则。

## License

MIT
