# 恰谷前端项目

这是一个基于 Turborepo 的 monorepo 项目，包含以下应用和包：

## 项目结构

### 应用（apps）
- `apps/qia-platform`: 恰谷平台前端应用
  - 技术栈：Next.js + Ant Design
  - 功能：用户管理、权限控制、系统设置等

- `apps/qia-factory`: 恰谷工厂前端应用
  - 技术栈：Next.js + Ant Design
  - 功能：产品管理、订单管理、生产管理等

- `apps/qia-editor`: 恰谷图片编辑器前端应用
  - 技术栈：Next.js + Konva.js
  - 功能：图片编辑、图层管理、特效处理等

### 包（packages）
- `packages/eslint-config-custom`: 共享的 ESLint 配置
  - 统一的代码规范配置
  - 支持 TypeScript 和 React

- `packages/tsconfig`: 共享的 TypeScript 配置
  - 基础 TypeScript 配置
  - 适用于所有子项目

## 开发环境要求

- Node.js >= 18.0.0
- pnpm >= 8.15.4
- Git

## 开始使用

1. 克隆项目：
```bash
git clone [项目地址]
cd qia-front-end
```

2. 安装依赖：
```bash
pnpm install
```

3. 开发模式：
```bash
# 开发所有应用
pnpm dev

# 开发特定应用
pnpm dev --filter qia-platform
pnpm dev --filter qia-factory
pnpm dev --filter qia-editor
```

4. 构建项目：
```bash
# 构建所有应用
pnpm build

# 构建特定应用
pnpm build --filter qia-platform
pnpm build --filter qia-factory
pnpm build --filter qia-editor
```

5. 代码检查：
```bash
# 检查所有项目
pnpm lint

# 检查特定项目
pnpm lint --filter qia-platform
pnpm lint --filter qia-factory
pnpm lint --filter qia-editor
```

6. 清理构建文件：
```bash
# 清理所有项目
pnpm clean

# 清理特定项目
pnpm clean --filter qia-platform
pnpm clean --filter qia-factory
pnpm clean --filter qia-editor
```

## 项目规范

1. 代码规范
   - 使用 ESLint 进行代码检查
   - 使用 Prettier 进行代码格式化
   - 遵循 TypeScript 严格模式

2. Git 提交规范
   - 使用 Conventional Commits 规范
   - 提交前进行代码检查
   - 保持提交信息清晰明确

3. 分支管理
   - `main`: 主分支，保持稳定
   - `develop`: 开发分支，用于日常开发
   - `feature/*`: 功能分支，用于开发新功能
   - `bugfix/*`: 修复分支，用于修复问题

## 常见问题

1. 依赖安装失败
   - 检查 Node.js 和 pnpm 版本
   - 清除 pnpm 缓存：`pnpm store prune`
   - 重新安装：`pnpm install`

2. 构建失败
   - 检查依赖是否完整
   - 清理构建缓存：`pnpm clean`
   - 重新构建：`pnpm build`

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

[许可证类型]