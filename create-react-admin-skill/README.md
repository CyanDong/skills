# create-react-admin-skill

快速创建 React + TypeScript + Ant Design 中后台项目的 Agent Skill 脚手架。

## 快速开始

```bash
# 使用 npx（推荐）
npx create-react-admin-skill my-admin

# 或全局安装
npm install -g create-react-admin-skill
create-react-admin-skill my-admin
```

## 用法

```bash
# 交互模式
npx create-react-admin-skill

# 指定项目名
npx create-react-admin-skill my-admin

# 在当前目录初始化
npx create-react-admin-skill .

# 完整参数
npx create-react-admin-skill my-admin -a "运营后台" -p npm -y
```

## 选项

| 选项                    | 说明                           | 默认值           |
| ----------------------- | ------------------------------ | ---------------- |
| `-a, --app-name`        | 应用展示名称                   | `中后台管理系统` |
| `-p, --package-manager` | 包管理器（npm/pnpm/yarn）      | `npm`            |
| `--no-install`          | 仅生成项目文件，不自动安装依赖 | `false`          |
| `-y, --yes`             | 跳过覆盖确认                   | `false`          |
| `-h, --help`            | 显示帮助                       | -                |

## 生成内容

脚手架会基于 Vite React-TS 模板生成，并注入以下中后台基础能力：

- Ant Design 组件体系
- React Router 路由组织
- 后台布局（侧边栏 + 顶栏 + 内容区）
- 仪表盘、用户管理、登录页、404 页面
- 全局主题与基础样式

## 示例

```bash
# npm
npx create-react-admin-skill operation-admin -p npm -y

# pnpm
npx create-react-admin-skill operation-admin -p pnpm

# 仅生成，不安装依赖
npx create-react-admin-skill operation-admin --no-install
```

## 项目启动

```bash
cd my-admin
npm install
npm run dev
```

## 作为 Agent Skill 使用

查看 [SKILL.md](./SKILL.md) 获取 Copilot/Claude 的推荐执行流程。

## 打包发布

```bash
# 在本目录执行
npm pack

# 产物示例
# create-react-admin-skill-1.0.0.tgz
```

## 许可证

MIT
