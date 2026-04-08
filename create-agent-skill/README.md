# create-agent-skills

快速创建 AI Agent Skills 模板的脚手架工具。

[![npm version](https://badge.fury.io/js/create-agent-skills.svg)](https://badge.fury.io/js/create-agent-skills)

## 快速开始

```bash
# 使用 npx（推荐）
npx create-agent-skills my-skill

# 或全局安装
npm install -g create-agent-skills
create-agent-skills my-skill
```

## 用法

```bash
# 创建新 Skill（交互模式）
npx create-agent-skills

# 指定名称创建
npx create-agent-skills my-skill

# 在当前目录创建
npx create-agent-skills .

# 完整参数创建
npx create-agent-skills my-skill -d "我的 Skill" -a "developer" -t full -y
```

## 选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `-d, --description` | Skill 描述 | `A custom agent skill` |
| `-a, --author` | 作者名称 | `anonymous` |
| `-t, --type` | Skill 类型 | `basic` |
| `-y, --yes` | 跳过确认提示 | `false` |
| `-h, --help` | 显示帮助信息 | - |

## Skill 类型

### basic（基础型）

仅生成核心配置文件：

```
my-skill/
└── SKILL.md
```

### scripted（脚本型）

包含可执行脚本：

```
my-skill/
├── SKILL.md
└── scripts/
    ├── main.sh
    └── main.ps1
```

### full（完整型）

包含示例和测试：

```
my-skill/
├── SKILL.md
├── scripts/
│   ├── main.sh
│   └── main.ps1
├── examples/
│   └── example-usage.md
└── tests/
    └── test-skill.sh
```

## 示例

### 创建一个代码审查 Skill

```bash
npx create-agent-skills code-review \
  -d "自动审查代码并提供改进建议" \
  -a "your-name" \
  -t scripted
```

### 创建完整的测试辅助 Skill

```bash
npx create-agent-skills test-helper \
  -d "自动生成单元测试用例" \
  -a "team" \
  -t full \
  -y
```

## 生成的 SKILL.md 结构

```markdown
```skill
---
name: my-skill
description: 描述
metadata:
  author: 作者
  version: "1.0.0"
  argument-hint: <argument>
---

# My Skill

## 用法
## Claude 执行指南
## 约束条件
## 示例
## 错误处理
```
```

## 什么是 Agent Skills？

Agent Skills 是用于指导 AI Agent（如 GitHub Copilot、Claude）执行特定任务的结构化指令集。通过 Skills，你可以：

- 🎯 定制 AI 的行为和响应方式
- 🔧 集成工具和自动化脚本
- 📋 标准化任务执行流程
- ✅ 确保输出质量和一致性

## 相关资源

- [Agent Skills 编写指南](https://github.com/CyanDong/skills/blob/main/how-to-write-agent-skills/agent-skills-guide.md)
- [Skills 最佳实践](https://github.com/CyanDong/skills/blob/main/how-to-write-skills.md)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
