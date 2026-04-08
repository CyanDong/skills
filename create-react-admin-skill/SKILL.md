```skill
---
name: create-react-admin-skill
description: 快速创建 React + TypeScript + Ant Design 中后台项目。当用户要求“初始化后台项目”“创建运营管理后台”“搭建 React+TS+Antd 管理系统”时使用。
metadata:
  author: copilot
  version: "1.0.0"
  argument-hint: <project-name>
---

# Create React Admin Skill

快速创建可直接运行的 React + TypeScript + Ant Design 中后台项目模板。

## 用法

```

/create-react-admin-skill <project-name>
/create-react-admin-skill . # 在当前目录初始化

````

---

## Claude 执行指南

优先使用脚本非交互参数模式，避免阻塞式提问。

### 推荐执行方式

```bash
# macOS / Linux
bash <skill-base-dir>/scripts/create-project.sh <project-name> -a "<app-name>" -p "npm" -y

# Windows PowerShell
powershell -File <skill-base-dir>/scripts/create-project.ps1 <project-name> -a "<app-name>" -p "npm" -y
````

### 参数说明

| 参数                    | 说明                          | 默认值           |
| ----------------------- | ----------------------------- | ---------------- |
| `project-name`          | 项目目录名，`.` 表示当前目录  | `admin-app`      |
| `-a, --app-name`        | 应用展示名称                  | `中后台管理系统` |
| `-p, --package-manager` | 包管理器：`npm`/`pnpm`/`yarn` | `npm`            |
| `--no-install`          | 不自动安装依赖                | `false`          |
| `-y, --yes`             | 自动确认覆盖                  | `false`          |
| `-h, --help`            | 显示帮助                      | -                |

### Claude 执行流程

1. 解析命令参数，确认项目名与包管理器。
2. 若参数缺失，用提问工具补齐以下信息：
   - 是否在当前目录创建。
   - 项目名称（若不在当前目录）。
   - 应用展示名称。
   - 包管理器。
3. 调用脚本创建项目并安装依赖。
4. 告知用户运行方式与后续改造建议。

### 示例命令

```bash
# 快速创建
bash scripts/create-project.sh operation-admin -a "运营管理后台" -p npm -y

# 当前目录初始化且不安装依赖
bash scripts/create-project.sh . --no-install -y
```

### 错误处理

- 目录已存在且非空：未指定 `-y` 时提示确认。
- 包管理器不存在：提示安装或改用 `npm`。
- 网络失败：保留已生成代码并提醒手动安装依赖。

---

## 生成项目结构

```
<project-name>/
├── src/
│   ├── layouts/
│   │   └── AdminLayout.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Login.tsx
│   │   └── NotFound.tsx
│   ├── router/
│   │   └── index.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
└── ...
```

---

## 完成后提示模板

创建完成后返回：

1. 项目目录与初始化结果。
2. 启动命令：`cd <project-name> && <pm> run dev`
3. 下一步建议：接入接口层、权限体系、状态管理。

```

```
