# Agent Instructions

## 部署工作流
- 构建产品使用 Next.js 静态导出（`output: 'export'`，`distDir: 'dist'`），生成 `dist` 目录。
- 将 `dist` 内容复制到 `.vercel/output/static`，并写入 `.vercel/output/config.json`（Build Output API v3，包含 `/patient/:id` 路由重写）。
- 使用 Vercel CLI 的 `--prebuilt` 模式部署到已链接项目：
  - `vercel deploy --prebuilt --prod --yes --token <VERCEL_TOKEN>`
  - 需设置 `APPDATA` 和 `LOCALAPPDATA` 到可写目录（如项目根目录 `.vercel-cache`），避免 Windows 系统目录权限错误。
- 项目已通过 `.vercel/project.json` 链接到 `clinical-assistant`（`prj_kYz2qhKdt4BC5I7b0Odrk6jfUwEO`）。
- 项目根目录 `.git` 只读，因此使用 GitHub REST API（`git/blobs`、`git/trees`、`git/commits`、`git/refs`）将源码直接推送到 `Niyoubingbing/clinical-assistant`。
  - 源码推送到 GitHub 后，Vercel 可自动基于 Git 仓库构建；但当前版本地 `next build` 已正常，为保持流程一致，仍采用先本地构建再 `--prebuilt` 部署。
- 环境限制：
  - PowerShell 执行策略会阻止 npm/npx 的 `.ps1` 脚本，构建与包命令优先使用 `cmd`。
  - Windows 原生 Schannel 在此环境无法完成 GitHub/Vercel 的 TLS 握手（`SEC_E_NO_CREDENTIALS`），因此使用 Node.js `fetch` 调用 REST API。
  - 首次安装依赖后，需执行 `pnpm approve-builds esbuild` 允许 esbuild 的 postinstall 脚本。
  - 由于 `pnpm next build` / `pnpm exec next build` 在当前环境无法定位 `next` 二进制，构建命令使用 `node_modules\.bin\next.CMD build`（通过 `cmd`）。
  - Token 通过环境变量注入（`VERCEL_TOKEN`、`GITHUB_TOKEN`），脚本中不记录明文。

## 用户习惯
- 中文是文档、注释和界面的主要语言。
- `PRD.md` 是单一事实来源。
- 将新习惯、决策和项目约定记录到 `Agent.md`。
- 使用仓库已有的框架和模式，避免发明新抽象。
- 测试覆盖随变更范围扩展。
- 对 `PRD.md` 未覆盖的决策，先做确认再做大改动。
- 用户主动要求将本次决策和习惯更新到 `Agent.md`。
- 部署接受 prebuilt 流程，GitHub 源码使用 REST API 推送而非 `git push`。
- 喜欢在首页通过浏览器通知 + 提醒栏主动提示当天到期、换药、查血。
- 期望每日小结同时支持文本复制和 JSON 导出，便于交接/记录。
- 源码推送时排除本地开发脚本（如 `deploy-prebuilt.js`、`push-github.js`）与构建产物，避免仓库嘈杂。
- 在 `PRD.md` 验收阶段，会主动要求把未覆盖的交互细节（如提醒栏筛选、待办左滑完成、查房顺序实时预览）补齐，并同步更新到 `Agent.md`。
- 提醒栏优先跳转到最紧迫的筛选视图：`overdue` > `today` > `all`。
- 待办列表通过 `?filter=...` 初始化筛选时，不使用 `useSearchParams`，而是在客户端 `useEffect` 中读取 `window.location.search`。
- 待办项左滑需要露出“完成”和“删除”两个按钮，滑动距离与按钮宽度一致。
- 设置页的查房顺序需要实时预览，并支持一键重置为按床号数字排序的默认顺序。
- 构建验证通过后，再执行 GitHub 推送与 Vercel 部署。

## 项目背景
- 基于 `PRD.md` 的临床助手项目。
- 实现严格遵循 `PRD.md` 需求。

## 实现决策
- 技术栈：Next.js 15 + TypeScript + Tailwind CSS + Dexie.js + next-pwa + framer-motion + lucide-react + pinyin-pro。
- 输出模式：`output: 'export'`，`distDir: 'dist'`，用于静态部署。
- 日期/时间：使用本地日期格式，避免 UTC 导致跨天时间差问题。
- 数据存储：IndexedDB via Dexie，本地离线可用。
- 主题：CSS 变量 + `dark` class，支持 light/dark/system。
- 动态路由：病人详情页使用 `generateStaticParams` 生成占位路径，并在客户端通过 `useParams` 读取真实 ID，适配静态导出；Vercel 端通过 rewrite 将 `/patient/:id` 指向 `/patient/new.html`。
- 图标：使用 SVG 图标（`public/icons/icon.svg`），因为环境 Python/PIL 可用于生成 PNG。
- 提醒与状态保持：
  - 首页挂载时请求浏览器通知权限，并每小时轮询一次，针对当天到期/逾期待办、需换药、需查血的记录发送通知；使用 `Set` 去重避免重复弹窗。
  - 首页离开前（`beforeunload`）和组件卸载时保存 `scrollY`，返回时恢复滚动位置。
- 每日小结：`components/summary-card.tsx` 在“复制”按钮旁增加 JSON 导出按钮，下载包含日期、换药数、查血数、按病人分组已完成待办的结构化文件。
- 智能时间解析：在 `lib/time-parser.ts` 中，当用户输入“周X”时，如果当天就是周X，则返回当天；只有明确出现“下星期/下礼拜/下下”等词时才返回下一周，“下周X”视为本周X。
- 分组颜色标签：在 `components/patient-card.tsx` 中，分组标签使用 `patient.groupColor` 作为背景色，并通过亮度算法自动选择黑/白文字色，使分组颜色更直观。
- 批量导入预览：在 `components/import-dialog.tsx` 中，预览导入结果时列出新增/更新/删除的具体病人（床号、姓名、诊断），而不是仅数量。
- 分组颜色对比文字：在 `components/patient-card.tsx` 和 `app/patient/[id]/patient-detail-client.tsx` 中，床号头像与分组标签均使用 `contrastTextColor` 根据背景亮度自动选择黑/白文字，提升可读性。

## 最新部署实例
- 生产 URL：`https://clinical-assistant-8tt5pfx6y-jaidens-projects-efaf9555.vercel.app`
- 别名：`https://clinical-assistant-omega.vercel.app`
- 项目 ID：`prj_kYz2qhKdt4BC5I7b0Odrk6jfUwEO`
- 部署 ID：`dpl_5mwXouHAaR1JAVkxb4u9JvgbzB8W`
- GitHub 仓库：`https://github.com/Niyoubingbing/clinical-assistant`

## 协作备注
- 当新习惯或约定出现时，更新本文件。
- 当前 Git 仓库只读，后续如需同步代码到 GitHub，请使用 Node.js 脚本或 API 方式，避免直接 `git push`。

## 验收修复记录（2026-07-06）
- 修复 lib/utils.ts 中的 addDays / daysBetween：使用本地日期解析（new Date(y, m-1, d)），避免 UTC 跨天时差导致日期偏移。
- 同步修复 lib/time-parser.ts 中的本地 addDays 为同样的本地日期解析逻辑。
- 修复 app/todos/page.tsx：完成换药待办时，lastDressingChange 改用 today()，避免 toISOString() 的 UTC 偏差。
- 构建 Next.js 静态导出（dist）通过，PWA 生成正常。
- 待办项左滑在 touch 设备上可露出完成/删除按钮；桌面端当前通过复选框完成，符合 PRD 可接受范围。

## 部署更新记录（2026-07-06）
- 源码已推送至 GitHub：Niyoubingbing/clinical-assistant（commit: cc6e4d6a93a0b9f0da0c6f041d0fc55dd52b3226）。
- 生产部署成功：https://clinical-assistant-ao5bbwv2f-jaidens-projects-efaf9555.vercel.app
- 别名：https://clinical-assistant-omega.vercel.app
- 部署 ID：dpl_3Ui9Mp6PcyrC2kP8TUGFu1pi8VvB
- 检查面板：https://vercel.com/jaidens-projects-efaf9555/clinical-assistant/3Ui9Mp6PcyrC2kP8TUGFu1pi8VvB


## 状态校验记录（2026-07-06）
- 使用 Vercel CLI inspect 确认部署 dpl_3Ui9Mp6PcyrC2kP8TUGFu1pi8VvB 状态为 Ready。
- 通过 GitHub API 确认 master 最新 commit 为 cc6e4d6a93a0b9f0da0c6f041d0fc55dd52b3226，修正了 Agent.md 中的 commit 哈希。
- 修正后的 Agent.md 已再次推送至 GitHub，master 更新为 commit 30cda77cee21f83cb5923fa3ccae7eeba7c88dfa。


## PRD 验收记录（2026-07-06）

本次验收依据 `PRD.md` v1.0 对临床助手进行全面功能复核，确认以下功能已实现并符合需求：

- 病人管理
  - 病人列表按自定义查房顺序排序，支持分组筛选、床号/姓名/诊断搜索、拼音首字母搜索。
  - 添加/编辑病人信息，支持分组、手术日期、换药频率、上次换药、查血日期等字段。
  - 批量导入病人：粘贴文本预览新增/更新/删除，确认后导入并显示结果统计。
- 待办管理
  - 添加待办支持自由文本与智能时间解析（星期、今明后天、具体日期）。
  - 待办列表支持全部/未完成/已完成/今天到期/已逾期筛选，按时间排序。
  - 左滑待办露出完成/删除按钮；桌面端通过复选框完成。
  - 智能提醒：首页顶部提醒栏优先显示最紧迫状态（overdue > today > all），并支持浏览器通知。
- 查房功能
  - 查房列表按设置顺序展示病人，保留滚动位置。
  - 病人详情页展示信息与待办，支持快速标记换药/查血、添加待办。
  - 完成换药待办时自动更新 `lastDressingChange`。
- 快捷操作
  - 病人详情页支持自定义快捷待办。
  - 首页 FAB 菜单动画展开，支持添加病人、批量导入、添加通用待办。
- 每日小结
  - 自动生成当天小结，列出已完成待办、换药/查血记录。
  - 支持复制文本与导出 JSON。
- 设置
  - 主题切换（浅色/深色/系统）无刷新。
  - 查房顺序设置实时预览，支持一键重置为床号默认顺序。
  - 快捷待办支持添加/删除/排序。
  - 数据导出/导入/清除功能。

**验收修复**：
- `app/settings/page.tsx`：补充缺失的 `Todo` 类型导入，解决 TypeScript 构建错误。
- `lib/time-parser.ts`：修正 `isNextWeek` 判断，仅当明确出现“下星期/下礼拜/下下”时视为下一周；“下周X”统一按本周X处理。

验收结果：本地 `next build` 静态导出通过，无类型/lint 错误；Vercel 生产部署成功。

## 部署更新记录（2026-07-06 PRD 验收后）

- 源码已重新推送至 GitHub：`Niyoubingbing/clinical-assistant`（包含 PRD 验收修复）。
- 生产部署成功：`https://clinical-assistant-8tt5pfx6y-jaidens-projects-efaf9555.vercel.app`
- 别名：`https://clinical-assistant-omega.vercel.app`
- 部署 ID：`dpl_5mwXouHAaR1JAVkxb4u9JvgbzB8W`
- 检查面板：`https://vercel.com/jaidens-projects-efaf9555/clinical-assistant/5mwXouHAaR1JAVkxb4u9JvgbzB8W`
- 备注：本次推送在 PRD 验收修复后执行，源代码已更新 `Agent.md` 与最新部署记录。

## 状态校验记录（2026-07-06 PRD 验收后）

- 本地 `next build` 静态导出通过，PWA 生成正常。
- 部署 `dpl_5mwXouHAaR1JAVkxb4u9JvgbzB8W` 状态 Ready，生产 URL 可访问。
- 通过 GitHub API 确认 `master` 分支最新 commit 与本次推送一致。
- 更新 `Agent.md` 记录 PRD 验收结果、修复细节与最新部署信息。
