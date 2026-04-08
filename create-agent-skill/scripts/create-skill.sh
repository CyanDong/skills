#!/usr/bin/env bash
set -e

DEFAULT_DESCRIPTION="A custom agent skill"
DEFAULT_AUTHOR="anonymous"
DEFAULT_TYPE="basic"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 显示帮助
show_help() {
  cat << EOF
Usage: $(basename "$0") [skill-name] [options]

Arguments:
  skill-name              Skill directory name (use "." for current directory)
                          If not provided, will prompt interactively

Options:
  -d, --description <desc>  Skill description (default: "$DEFAULT_DESCRIPTION")
  -a, --author <name>       Author name (default: "$DEFAULT_AUTHOR")
  -t, --type <type>         Skill type: basic|scripted|full (default: "$DEFAULT_TYPE")
  -y, --yes                 Auto-confirm overwrite without prompting
  -h, --help                Show this help message

Skill Types:
  basic     - Only SKILL.md
  scripted  - SKILL.md + scripts/
  full      - SKILL.md + scripts/ + examples/ + tests/

Examples:
  $(basename "$0") my-skill
  $(basename "$0") . -d "My awesome skill" -a "developer" -t basic -y
  $(basename "$0") my-skill -t full

Interactive Mode:
  Without arguments, the script will prompt for all options.
EOF
  exit 0
}

# 转换为 Title Case
to_title_case() {
  echo "$1" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1'
}

# 验证 skill 名称
validate_skill_name() {
  local name="$1"
  if [[ ! "$name" =~ ^[a-z][a-z0-9-]*$ ]]; then
    echo -e "${RED}Error: Skill name must start with a letter and contain only lowercase letters, numbers, and hyphens.${NC}" >&2
    exit 1
  fi
}

# 解析参数
SKILL_NAME=""
DESCRIPTION=""
AUTHOR=""
SKILL_TYPE=""
AUTO_YES=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help) show_help ;;
    -d|--description) DESCRIPTION="$2"; shift 2 ;;
    -a|--author) AUTHOR="$2"; shift 2 ;;
    -t|--type) SKILL_TYPE="$2"; shift 2 ;;
    -y|--yes) AUTO_YES=true; shift ;;
    -*) echo -e "${RED}Unknown option: $1${NC}" >&2; echo "Use -h or --help for usage information."; exit 1 ;;
    *) SKILL_NAME="$1"; shift ;;
  esac
done

# 交互模式：询问创建位置
if [[ -z "$SKILL_NAME" ]]; then
  if [[ -t 0 ]]; then
    printf "Create skill in current directory? [y/N]: "
    read -r USE_CURRENT_DIR

    if [[ "$USE_CURRENT_DIR" =~ ^[Yy]$ ]]; then
      IS_CURRENT_DIR=true
      TARGET_DIR="$(pwd)"
      SKILL_NAME="$(basename "$TARGET_DIR")"
    else
      printf "Skill name [my-skill]: "
      read -r SKILL_NAME
      SKILL_NAME="${SKILL_NAME:-my-skill}"
      IS_CURRENT_DIR=false
      TARGET_DIR="$(pwd)/$SKILL_NAME"
    fi
  else
    echo -e "${RED}Error: Skill name is required in non-interactive mode.${NC}" >&2
    exit 1
  fi
else
  IS_CURRENT_DIR=false
  if [[ "$SKILL_NAME" == "." ]]; then
    IS_CURRENT_DIR=true
    TARGET_DIR="$(pwd)"
    SKILL_NAME="$(basename "$TARGET_DIR")"
  else
    TARGET_DIR="$(pwd)/$SKILL_NAME"
  fi
fi

# 验证名称
validate_skill_name "$SKILL_NAME"

# 交互模式：询问描述
if [[ -z "$DESCRIPTION" ]]; then
  if [[ -t 0 ]]; then
    printf "Skill description [%s]: " "$DEFAULT_DESCRIPTION"
    read -r DESCRIPTION
    DESCRIPTION="${DESCRIPTION:-$DEFAULT_DESCRIPTION}"
  else
    DESCRIPTION="$DEFAULT_DESCRIPTION"
  fi
fi

# 交互模式：询问作者
if [[ -z "$AUTHOR" ]]; then
  if [[ -t 0 ]]; then
    printf "Author name [%s]: " "$DEFAULT_AUTHOR"
    read -r AUTHOR
    AUTHOR="${AUTHOR:-$DEFAULT_AUTHOR}"
  else
    AUTHOR="$DEFAULT_AUTHOR"
  fi
fi

# 交互模式：询问类型
if [[ -z "$SKILL_TYPE" ]]; then
  if [[ -t 0 ]]; then
    printf "Skill type (basic/scripted/full) [%s]: " "$DEFAULT_TYPE"
    read -r SKILL_TYPE
    SKILL_TYPE="${SKILL_TYPE:-$DEFAULT_TYPE}"
  else
    SKILL_TYPE="$DEFAULT_TYPE"
  fi
fi

# 验证类型
case "$SKILL_TYPE" in
  basic|scripted|full) ;;
  *) echo -e "${RED}Error: Invalid skill type '$SKILL_TYPE'. Must be: basic, scripted, or full.${NC}" >&2; exit 1 ;;
esac

# 检查目录
if [[ -d "$TARGET_DIR" ]]; then
  if [[ "$IS_CURRENT_DIR" == true ]]; then
    items=$(find "$TARGET_DIR" -mindepth 1 -maxdepth 1 ! -name ".git" | wc -l)
    if [[ "$items" -gt 0 ]]; then
      if [[ "$AUTO_YES" == true ]]; then
        echo -e "${YELLOW}Auto-confirming overwrite (--yes flag)${NC}"
      else
        printf "Current directory is not empty. Overwrite existing files? [y/N]: "
        read -r OVERWRITE
        if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
          echo -e "${RED}Operation cancelled.${NC}"
          exit 1
        fi
      fi
    fi
  else
    if [[ "$AUTO_YES" == true ]]; then
      echo -e "${YELLOW}Auto-confirming overwrite (--yes flag)${NC}"
      rm -rf "$TARGET_DIR"
    else
      printf "Directory '%s' already exists. Overwrite? [y/N]: " "$SKILL_NAME"
      read -r OVERWRITE
      if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        echo -e "${RED}Operation cancelled.${NC}"
        exit 1
      fi
      rm -rf "$TARGET_DIR"
    fi
  fi
fi

# 创建目录
mkdir -p "$TARGET_DIR"

SKILL_TITLE=$(to_title_case "$SKILL_NAME")

echo -e "${CYAN}Creating skill '$SKILL_NAME'...${NC}"

# 创建 SKILL.md
cat > "$TARGET_DIR/SKILL.md" << EOF
\`\`\`skill
---
name: $SKILL_NAME
description: $DESCRIPTION
metadata:
  author: $AUTHOR
  version: "1.0.0"
  argument-hint: <argument>
---

# $SKILL_TITLE

$DESCRIPTION

## 用法

\`\`\`
/$SKILL_NAME <argument>
\`\`\`

---

## Claude 执行指南

### 执行流程

1. **理解需求**: 分析用户输入，明确任务目标
2. **收集上下文**: 获取必要的环境和项目信息
3. **执行任务**: 按照指令逐步执行
4. **验证结果**: 确认任务完成情况
5. **返回结果**: 汇报执行情况和后续建议

### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| \`argument\` | 参数描述 | - |

---

## 约束条件

### ⚠️ 必须遵守

- 在执行破坏性操作前确认
- 保持代码风格一致性
- 记录所有重要变更

### ❌ 禁止行为

- 删除重要文件而不备份
- 修改不相关的代码
- 跳过验证步骤

---

## 示例

### 基本用法

\`\`\`
/$SKILL_NAME example-input
\`\`\`

### 高级用法

\`\`\`
/$SKILL_NAME complex-input --option value
\`\`\`

---

## 错误处理

| 错误 | 处理方式 |
|------|---------|
| 参数无效 | 提示正确格式 |
| 文件不存在 | 建议创建或检查路径 |
| 权限不足 | 说明需要的权限 |

---

## 相关资源

- [Agent Skills 编写指南](../how-to-write-agent-skills/agent-skills-guide.md)
- [Skills 最佳实践](../how-to-write-skills.md)
\`\`\`
EOF

# 根据类型创建额外文件
if [[ "$SKILL_TYPE" == "scripted" || "$SKILL_TYPE" == "full" ]]; then
  mkdir -p "$TARGET_DIR/scripts"
  
  # 创建 main.sh
  cat > "$TARGET_DIR/scripts/main.sh" << 'SCRIPT_EOF'
#!/usr/bin/env bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

show_help() {
  cat << EOF
Usage: $(basename "$0") [options]

Options:
  -h, --help    Show this help message

Examples:
  $(basename "$0")
EOF
  exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help) show_help ;;
    -*) echo -e "${RED}Unknown option: $1${NC}" >&2; exit 1 ;;
    *) shift ;;
  esac
done

echo -e "${CYAN}Executing skill...${NC}"

# TODO: Add your logic here

echo -e "${GREEN}Done!${NC}"
SCRIPT_EOF

  chmod +x "$TARGET_DIR/scripts/main.sh"

  # 创建 main.ps1
  cat > "$TARGET_DIR/scripts/main.ps1" << 'SCRIPT_EOF'
param(
  [switch]$Help
)

function Write-Color {
  param([string]$Text, [string]$Color = "White")
  Write-Host $Text -ForegroundColor $Color
}

if ($Help) {
  Write-Host @"
Usage: .\main.ps1 [options]

Options:
  -Help    Show this help message

Examples:
  .\main.ps1
"@
  exit 0
}

Write-Color "Executing skill..." "Cyan"

# TODO: Add your logic here

Write-Color "Done!" "Green"
SCRIPT_EOF
fi

if [[ "$SKILL_TYPE" == "full" ]]; then
  # 创建 examples 目录
  mkdir -p "$TARGET_DIR/examples"
  cat > "$TARGET_DIR/examples/example-usage.md" << EOF
# $SKILL_TITLE - 使用示例

## 示例 1：基本用法

\`\`\`
/$SKILL_NAME basic-input
\`\`\`

**预期结果**：描述预期输出

---

## 示例 2：高级用法

\`\`\`
/$SKILL_NAME advanced-input --option value
\`\`\`

**预期结果**：描述预期输出

---

## 示例 3：错误处理

\`\`\`
/$SKILL_NAME invalid-input
\`\`\`

**预期结果**：应该显示友好的错误提示
EOF

  # 创建 tests 目录
  mkdir -p "$TARGET_DIR/tests"
  cat > "$TARGET_DIR/tests/test-skill.sh" << 'TEST_EOF'
#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

echo "Running tests for skill..."

# Test 1: Help command
echo "Test 1: Help command"
bash "$SKILL_DIR/scripts/main.sh" --help && echo "PASS" || echo "FAIL"

# Test 2: Basic execution
echo "Test 2: Basic execution"
bash "$SKILL_DIR/scripts/main.sh" && echo "PASS" || echo "FAIL"

echo "All tests completed!"
TEST_EOF

  chmod +x "$TARGET_DIR/tests/test-skill.sh"
fi

echo ""
echo -e "${GREEN}✓ Skill '$SKILL_NAME' created successfully!${NC}"
echo ""
echo "Created files:"
echo "  $TARGET_DIR/SKILL.md"
if [[ "$SKILL_TYPE" == "scripted" || "$SKILL_TYPE" == "full" ]]; then
  echo "  $TARGET_DIR/scripts/main.sh"
  echo "  $TARGET_DIR/scripts/main.ps1"
fi
if [[ "$SKILL_TYPE" == "full" ]]; then
  echo "  $TARGET_DIR/examples/example-usage.md"
  echo "  $TARGET_DIR/tests/test-skill.sh"
fi
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "  1. Edit SKILL.md to customize your skill"
echo "  2. Add your logic to scripts/ (if applicable)"
echo "  3. Test your skill with different inputs"
