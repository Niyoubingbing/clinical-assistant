# Agent Instructions

## 部署工作流
- 构建产物使用 Next.js 静态导出（`output: 'export'`，`distDir: 'dist'`），生成 `dist` 目录。
- 直接通过 Vercel REST API（`/v13/deployments`）上传 `dist` 内容进行部署，而非 Vercel CLI。
- 环境限制：
  - 项目根目录 `.git` 只读，所有 Git 操作在临时仓库 `C:\Users\jaiden\AppData\Local\Temp\clinical-assistant` 完成。
  - 本地 Git 推送失效，使用 GitHub REST API（`gh api`）更新文件。
  - PowerShell 执行策略会阻止 npm/npx 的 `.ps1` 脚本，因此构建与包命令使用 `cmd`。
  - 在 `C:\tmp` 运行 Python 脚本时字节码写入失败，需加 `-B` 参数（如 `python -B C:\tmp\deploy_vercel.py`）。
- 已部署实例：
  - 主 URL：`https://clinical-assistant-1q00b0rm8-jaidens-projects-efaf9555.vercel.app`
  - 别名：`https://clinical-assistant-omega.vercel.app`
  - 项目 ID：`prj_kYz2qhKdt4BC5I7b0Odrk6jfUwEO`
  - 部署 ID：`dpl_8LyvmxpZ7eb7igMYoPS1TbneaNqF`

## 用户习惯
- 中文是文档、注释和界面的主要语言。
- PRD 是单一事实来源。
- 将新习惯、决策和项目约定记录到 `Agent.md`。
- 使用仓库已有的框架和模式，避免发明新抽象。
- 测试覆盖随变更范围扩展。

## 项目背景
- 基于 `PRD.md` 的临床助手项目。
- 实现严格遵循 PRD 需求。

## 实现决策
- 技术栈：Next.js 15 + TypeScript + Tailwind CSS + Dexie.js + next-pwa + framer-motion + lucide-react + pinyin-pro。
- 输出模式：`output: 'export'`，`distDir: 'dist'`，用于静态部署。
- 日期/时间：使用本地日期格式，避免 UTC 导致跨天时差问题。
- 数据存储：IndexedDB via Dexie，本地离线可用。
- 主题：CSS 变量 + `dark` class，支持 light/dark/system。
- 动态路由：病人详情页使用 `generateStaticParams` 生成占位路径，并在客户端通过 `useParams` 读取真实 ID，适配静态导出。
- 图标：使用 SVG 图标（`public/icons/icon.svg`），因为环境无 Python/PIL 可用于生成 PNG。

## 协作备注
- 对 PRD 未覆盖的决策，先做确认再做大幅改动。
- 当新习惯或约定出现时，更新本文件。
