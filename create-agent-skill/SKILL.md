```skill
---
name: create-agent-skill
description: 快速创建 Agent Skill 模板。当用户要求"创建 skill"、"新建 agent skill"、"初始化 skill"时使用。
metadata:
  author: copilot
  version: "1.0.0"
  argument-hint: <skill-name>
---

# Create Agent Skill

快速创建符合规范的 Agent Skill 模板，包含完整的目录结构和配置文件。

## 用法

```
/create-agent-skill <skill-name>
/create-agent-skill .          # 在当前目录初始化
```

---

## Claude 执行指南

**重要**: 脚本支持非交互模式，Claude 应使用命令行参数而非交互输入。

### 推荐执行方式

```bash
# macOS / Linux - 使用命令行参数（推荐）
bash <skill-base-dir>/scripts/create-skill.sh <skill-name> -d "<description>" -a "<author>" -t "<type>" -y

# Windows PowerShell
powershell -File <skill-base-dir>/scripts/create-skill.ps1 <skill-name> -d "<description>" -a "<author>" -t "<type>" -y
```

### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `skill-name` | Skill 目录名，`.` 表示当前目录 | `my-skill` |
| `-d, --description` | Skill 描述 | `A custom agent skill` |
| `-a, --author` | 作者名称 | `anonymous` |
| `-t, --type` | Skill 类型 | `basic` |
| `-y, --yes` | 自动确认覆盖，跳过确认提示 | `false` |
| `--with-scripts` | 同时生成脚本模板 | `false` |
| `-h, --help` | 显示帮助信息 | - |

### Skill 类型说明

| 类型 | 说明 | 生成内容 |
|-----|------|---------|
| `basic` | 基础 Skill | 仅 SKILL.md |
| `scripted` | 带脚本 Skill | SKILL.md + scripts/ |
| `full` | 完整 Skill | SKILL.md + scripts/ + examples/ + tests/ |

### Claude 执行流程

1. **解析用户参数**: 从 `/create-agent-skill` 命令获取 skill 名称（可选）
2. **询问必要信息**: 使用 `AskUserQuestion` 工具询问，问题顺序如下：

   | 顺序 | 问题 | 条件 |
   |------|------|------|
   | 1 | 是否在当前目录下创建 Skill？ | 必问 |
   | 2 | Skill 名称是什么？ | **仅当选择"否"时询问** |
   | 3 | Skill 描述是什么？ | 必问 |
   | 4 | 作者名称是什么？ | 必问 |
   | 5 | 选择 Skill 类型 | 必问 |

3. **执行脚本**: 根据用户回答组装命令参数
   - 选择"当前目录": `bash scripts/create-skill.sh . -d "<描述>" -a "<作者>" -t "<类型>" -y`
   - 选择"子目录": `bash scripts/create-skill.sh <skill名> -d "<描述>" -a "<作者>" -t "<类型>" -y`
4. **返回结果**: 告知用户 Skill 创建结果和后续步骤，并**主动引导**：

   > Skill 创建完成！后续步骤：
   > 1. 编辑 `SKILL.md` 完善指令内容
   > 2. 根据需要添加脚本或示例
   > 3. 参考 [Agent Skills 编写指南](../how-to-write-agent-skills/agent-skills-guide.md) 了解最佳实践

### 示例命令

```bash
# 在当前目录创建基础 Skill
bash scripts/create-skill.sh . -d "My awesome skill" -a "developer" -t basic -y

# 创建带脚本的完整 Skill
bash scripts/create-skill.sh my-skill -d "A powerful skill" -a "team" -t full -y
```

### 错误处理

- 如果目录非空且未使用 `-y` 参数，脚本会报错退出
- 如果 skill 名称包含非法字符，提示用户修正
- 如果类型无效，显示可用类型列表

---

## 用户手动执行

用户也可以直接在终端运行脚本：

### macOS / Linux

```bash
bash scripts/create-skill.sh [skill-name] [options]
```

### Windows（PowerShell）

```powershell
# 首次需开启执行权限
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

.\scripts\create-skill.ps1 [skill-name] [options]
```

### 交互模式

不传递参数时，脚本会进入交互模式依次询问：

| 顺序 | 问题 | 说明 |
|------|------|------|
| 1 | 是否在当前目录下创建 Skill？ | y=使用当前目录，N=创建子目录 |
| 2 | Skill 名称？ | **仅在上一步回答 N 时询问** |
| 3 | Skill 描述 | 必问 |
| 4 | 作者名称 | 必问 |
| 5 | Skill 类型 | basic/scripted/full |

---

## AskUserQuestion 配置

```yaml
questions:
  - header: 创建位置
    question: 是否在当前目录下直接创建 Skill？
    multiSelect: false
    options:
      - label: 是，当前目录
        value: current
      - label: 否，创建子目录
        value: subdirectory
  - header: Skill名称
    question: Skill 名称是什么？
    description: 用于创建 skill 文件夹，建议使用 kebab-case 格式
    multiSelect: false
    conditional: "{{answers['创建位置'] === 'subdirectory'}}"
  - header: Skill描述
    question: Skill 描述是什么？
    description: 简短描述 skill 的用途和触发场景
    multiSelect: false
  - header: 作者名称
    question: 作者名称是什么？
    description: 你的名字或团队名称
    multiSelect: false
  - header: Skill类型
    question: 选择 Skill 类型
    multiSelect: false
    options:
      - label: 基础型 (仅 SKILL.md)
        value: basic
      - label: 脚本型 (含 scripts/)
        value: scripted
      - label: 完整型 (含 scripts/ + examples/ + tests/)
        value: full
```

---

## 生成的目录结构

### 基础型 (basic)

```
<skill-name>/
└── SKILL.md
```

### 脚本型 (scripted)

```
<skill-name>/
├── SKILL.md
└── scripts/
    ├── main.sh
    └── main.ps1
```

### 完整型 (full)

```
<skill-name>/
├── SKILL.md
├── scripts/
│   ├── main.sh
│   └── main.ps1
├── examples/
│   └── example-usage.md
└── tests/
    └── test-skill.sh
```

---

## 生成的 SKILL.md 模板

```markdown
```skill
---
name: {{skill-name}}
description: {{description}}
metadata:
  author: {{author}}
  version: "1.0.0"
  argument-hint: <argument>
---

# {{Skill Name}}

{{description}}

## 用法

\`\`\`
/{{skill-name}} <argument>
\`\`\`

---

## Claude 执行指南

### 执行流程

1. **理解需求**: 分析用户输入
2. **执行任务**: 按照指令执行
3. **返回结果**: 汇报执行情况

### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `argument` | 参数描述 | - |

---

## 约束条件

- 约束 1
- 约束 2
- 约束 3

---

## 示例

\`\`\`
/{{skill-name}} example-input
\`\`\`
```
```

---

## 后续步骤

Skill 创建完成后主动告知：

1. **编辑 SKILL.md**: 根据实际需求完善指令内容
2. **添加脚本**: 如需自动化操作，在 `scripts/` 目录添加脚本
3. **测试验证**: 使用不同输入测试 skill 行为
4. **参考文档**: 
   - [Agent Skills 编写指南](../how-to-write-agent-skills/agent-skills-guide.md)
   - [Skills 编写最佳实践](../how-to-write-skills.md)

```
