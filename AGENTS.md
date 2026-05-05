# HandyHub - 专业维修服务平台

HandyHub 是一个连接客户与专业维修工人的全栈 Web 应用平台。用户可以预约各种家庭维修和维护服务。

## AI Assistant Guidelines

> **重要**: 以下规则适用于所有 AI 助手在此项目上的工作

### 服务器管理
- **禁止自动启动/重启/停止服务器** - 开发服务器、数据库服务等均由用户手动管理
- 如需服务器运行进行测试，请明确要求用户操作
- 默认假设服务器可能已在运行，避免重复启动

### 前端开发
- 修改 `.html/.css/.js/.jsx/.ts/.tsx/.vue` 文件后，必须使用 Playwright 进行可视化测试
- 测试命令: `npx playwright test --headed` 或 `npx playwright test --ui`
- 确保用户能看到浏览器实际运行效果

### 代码规范
- 遵循现有代码风格，不引入不一致的模式
- 优先编辑现有文件而非创建新文件
- 不主动创建文档文件 (*.md)，除非用户明确要求

## 技术栈

- **前端**: Next.js 14 (App Router), React 18, TypeScript 6
- **后端**: Next.js API Routes, NextAuth.js
- **数据库**: SQLite + Prisma ORM (支持 libsql)
- **样式**: Tailwind CSS v4 + 自定义设计系统
- **认证**: NextAuth.js (JWT 策略)
- **图表**: Recharts
- **测试**: Playwright
- **部署**: Docker, Docker Compose

## 关键依赖版本

| 包名 | 版本 | 用途 |
|------|------|------|
| next | ^14.2.35 | React 框架 |
| react | ^18.3.1 | UI 库 |
| typescript | ^6.0.2 | 类型检查 |
| prisma | ^7.5.0 | ORM |
| next-auth | ^4.24.13 | 认证 |
| tailwindcss | ^4.2.2 | CSS 框架 |
| recharts | ^3.8.0 | 图表库 |
| @playwright/test | ^1.58.2 | E2E 测试 |
| date-fns | ^4.1.0 | 日期处理 |
| bcryptjs | ^3.0.3 | 密码加密 |

## 项目结构

```
src/
├── app/                        # Next.js App Router
│   ├── admin/                  # 管理员仪表板
│   │   ├── AdminClient.tsx     # 管理端客户端组件
│   │   ├── layout.tsx          # 管理端布局
│   │   └── page.tsx            # 管理端页面
│   ├── api/                    # API 路由
│   │   └── auth/               # 认证端点
│   │       ├── [...nextauth]/  # NextAuth 路由
│   │       └── register/       # 注册 API
│   ├── dashboard/              # 用户仪表板
│   ├── forgot-password/        # 忘记密码页面
│   ├── login/                  # 登录页面
│   ├── register/               # 注册页面
│   ├── globals.css             # 全局样式 (现代设计系统)
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 首页
└── lib/
    ├── auth.ts                 # NextAuth 配置
    ├── prisma.ts               # Prisma 客户端
    ├── back-to-top.tsx         # 返回顶部组件
    ├── icons.tsx               # 图标组件
    ├── search-bar.tsx          # 搜索栏组件
    ├── skeleton.tsx            # 骨架屏组件
    └── toast.tsx               # Toast 通知组件
```

## 用户角色

- `CUSTOMER` - 客户，可以预约服务
- `HANDYMAN` - 工匠，提供服务
- `ADMIN` - 管理员，管理平台

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 数据库操作
npm run db:push       # 推送数据库 schema
npm run db:seed       # 填充种子数据
npm run db:studio     # 打开 Prisma Studio

# Docker 操作
npm run docker:up     # 启动 Docker 容器
npm run docker:down   # 停止 Docker 容器
npm run docker:build  # 构建 Docker 镜像

# 一键设置
npm run setup         # 安装依赖 + 生成 Prisma + 推送 schema

# 测试
npx playwright test            # 运行所有测试
npx playwright test --headed   # 可视化运行测试
npx playwright test --ui       # Playwright UI 模式
```

## 环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
# 数据库 (SQLite 本地开发)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# 应用设置
APP_NAME="HandyHub"
APP_DESCRIPTION="Professional Handyman Services"
```

## 数据库模型

### 核心模型
- **User** - 用户（客户/工匠/管理员）
- **HandymanProfile** - 工匠资料（含评分、工作经验、地理位置）
- **Service** - 服务类型
- **Booking** - 预约订单
- **Review** - 评价

### 辅助模型
- **HandymanService** - 工匠提供的服务（含自定义价格）
- **Availability** - 工匠可用时间（按周设置）
- **Certification** - 工匠认证
- **Notification** - 通知

## 服务类别 (ServiceCategory)

| 类别 | 英文 |
|------|------|
| 管道 | PLUMBING |
| 电气 | ELECTRICAL |
| 木工 | CARPENTRY |
| 油漆 | PAINTING |
| 清洁 | CLEANING |
| 暖通空调 | HVAC |
| 电器维修 | APPLIANCE_REPAIR |
| 锁匠 | LOCKSMITH |
| 搬家 | MOVING |
| 一般维修 | GENERAL_REPAIR |

## 预约状态 (BookingStatus)

| 状态 | 说明 |
|------|------|
| PENDING | 待确认 |
| CONFIRMED | 已确认 |
| IN_PROGRESS | 进行中 |
| COMPLETED | 已完成 |
| CANCELLED | 已取消 |

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/[...nextauth]` - NextAuth 端点

## 页面路由

| 路由 | 说明 | 权限 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/login` | 登录页面 | 公开 |
| `/register` | 注册页面 | 公开 |
| `/forgot-password` | 忘记密码 | 公开 |
| `/dashboard` | 用户仪表板 | 已登录 |
| `/admin` | 管理员仪表板 | ADMIN |

## 设计系统

### 颜色系统
- **Primary**: 蓝色系 (#2563eb) - 主色调
- **Accent**: 橙色系 (#f97316) - 强调色
- **Semantic**: success(绿), warning(黄), destructive(红), info(青)

### 特效
- **Glass Morphism**: 玻璃态效果 (`.glass`, `.glass-strong`)
- **Gradient Text**: 渐变文字 (`.gradient-text`)
- **Animations**: 浮动、脉冲发光、滑入、缩放等动画
- **Dark Mode**: 完整暗黑模式支持

### 组件样式
- **Buttons**: `.btn-primary`, `.btn-secondary`, `.btn-accent`, `.btn-outline`, `.btn-ghost`
- **Cards**: `.card`, `.card-hover`, `.card-glow`, `.card-gradient`
- **Forms**: `.input-field`, `.input-with-icon`
- **Badges**: `.badge-primary`, `.badge-accent`, `.badge-success`, `.badge-warning`, `.badge-error`

## 开发规范

### 认证
- 使用 NextAuth.js 的 `getServerSession` 获取用户会话
- JWT token 中包含 `role` 和 `id` 字段
- 登录页面: `/login`

### 数据库
- 使用 Prisma Client 进行数据库操作
- 开发环境下 Prisma Client 单例模式防止热重载问题
- SQLite 数据库文件位于 `prisma/dev.db`

### 样式
- 使用 Tailwind CSS v4
- 自定义 CSS 变量定义在 `globals.css`
- 支持响应式文字 (`.text-responsive-*`)

### 组件
- 使用 Heroicons 和 Lucide React 图标库
- 使用 Headless UI 处理交互组件
- 使用 Recharts 进行数据可视化
- 使用 date-fns 处理日期

## 快速开始

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
copy .env.example .env

# 3. 推送数据库 schema
npm run db:push

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### Docker 部署

```bash
# 启动所有服务
docker-compose up -d
```

## 测试

项目使用 Playwright 进行端到端测试：

```bash
# 首次运行需要安装浏览器
npx playwright install

# 运行测试
npx playwright test

# 可视化调试
npx playwright test --ui
```

测试配置文件: `playwright.config.ts`
测试文件目录: `tests/`

## 创建管理员账户

注册账户后，在数据库中更新角色：

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

或使用 Prisma Studio：

```bash
npm run db:studio
```

## 常见问题排查

### 数据库问题
```bash
# 重置数据库 (会删除所有数据)
npx prisma migrate reset

# 重新生成 Prisma 客户端
npx prisma generate

# 查看数据库状态
npx prisma studio
```

### 构建问题
```bash
# 清理 Next.js 缓存
Remove-Item -Recurse -Force .next

# 重新安装依赖
Remove-Item -Recurse -Force node_modules
npm install
```

### Playwright 问题
```bash
# 重新安装浏览器
npx playwright install --force

# 查看测试报告
npx playwright show-report
```

## 注意事项

- 密码使用 bcryptjs 加密存储
- 邮件地址存储时转为小写
- 工匠注册时自动创建 HandymanProfile
- 数据库使用 SQLite，生产环境可切换至 PostgreSQL
- Windows 环境使用 PowerShell 命令语法 (如 `copy` 而非 `cp`)