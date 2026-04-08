param(
  [string]$SkillName = "",
  [string][Alias('d')]$Description = "",
  [string][Alias('a')]$Author = "",
  [string][Alias('t')]$Type = "",
  [Alias('y')][switch]$AutoYes,
  [switch]$Help
)

$DEFAULT_DESCRIPTION = "A custom agent skill"
$DEFAULT_AUTHOR = "anonymous"
$DEFAULT_TYPE = "basic"

function Write-Color {
  param([string]$Text, [string]$Color = "White")
  Write-Host $Text -ForegroundColor $Color
}

function Show-Help {
  Write-Host @"
Usage: .\create-skill.ps1 [skill-name] [options]

Arguments:
  skill-name              Skill directory name (use "." for current directory)
                          If not provided, will prompt interactively

Options:
  -d, -Description <desc>  Skill description (default: "$DEFAULT_DESCRIPTION")
  -a, -Author <name>       Author name (default: "$DEFAULT_AUTHOR")
  -t, -Type <type>         Skill type: basic|scripted|full (default: "$DEFAULT_TYPE")
  -y, -AutoYes             Auto-confirm overwrite without prompting
  -Help                    Show this help message

Skill Types:
  basic     - Only SKILL.md
  scripted  - SKILL.md + scripts/
  full      - SKILL.md + scripts/ + examples/ + tests/

Examples:
  .\create-skill.ps1 my-skill
  .\create-skill.ps1 . -d "My awesome skill" -a "developer" -t basic -y
  .\create-skill.ps1 my-skill -t full
"@
  exit 0
}

function ConvertTo-TitleCase {
  param([string]$Text)
  $words = $Text -split '-'
  $result = ($words | ForEach-Object { $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower() }) -join ' '
  return $result
}

function Test-SkillName {
  param([string]$Name)
  if ($Name -notmatch '^[a-z][a-z0-9-]*$') {
    Write-Color "Error: Skill name must start with a letter and contain only lowercase letters, numbers, and hyphens." "Red"
    exit 1
  }
}

if ($Help) { Show-Help }

# 交互模式：询问创建位置
if (-not $SkillName) {
  $useCurrentDir = Read-Host "Create skill in current directory? [y/N]"

  if ($useCurrentDir -match '^[Yy]$') {
    $IsCurrentDir = $true
    $TargetDir = (Get-Location).Path
    $SkillName = Split-Path $TargetDir -Leaf
  } else {
    $inp = Read-Host "Skill name [my-skill]"
    if ($inp) { $SkillName = $inp } else { $SkillName = "my-skill" }
    $IsCurrentDir = $false
    $TargetDir = Join-Path (Get-Location).Path $SkillName
  }
} else {
  $IsCurrentDir = $false
  if ($SkillName -eq ".") {
    $IsCurrentDir = $true
    $TargetDir = (Get-Location).Path
    $SkillName = Split-Path $TargetDir -Leaf
  } else {
    $TargetDir = Join-Path (Get-Location).Path $SkillName
  }
}

Test-SkillName $SkillName

# 交互模式：询问描述
if (-not $Description) {
  $inp = Read-Host "Skill description [$DEFAULT_DESCRIPTION]"
  if ($inp) { $Description = $inp } else { $Description = $DEFAULT_DESCRIPTION }
}

# 交互模式：询问作者
if (-not $Author) {
  $inp = Read-Host "Author name [$DEFAULT_AUTHOR]"
  if ($inp) { $Author = $inp } else { $Author = $DEFAULT_AUTHOR }
}

# 交互模式：询问类型
if (-not $Type) {
  $inp = Read-Host "Skill type (basic/scripted/full) [$DEFAULT_TYPE]"
  if ($inp) { $Type = $inp } else { $Type = $DEFAULT_TYPE }
}

# 验证类型
if ($Type -notin @('basic', 'scripted', 'full')) {
  Write-Color "Error: Invalid skill type '$Type'. Must be: basic, scripted, or full." "Red"
  exit 1
}

# 检查目录
if (Test-Path $TargetDir) {
  if ($IsCurrentDir) {
    $items = Get-ChildItem $TargetDir -Force | Where-Object { $_.Name -ne ".git" }
    if ($items.Count -gt 0) {
      if ($AutoYes) {
        Write-Color "Auto-confirming overwrite (--yes flag)" "Yellow"
      } else {
        $overwrite = Read-Host "Current directory is not empty. Overwrite existing files? [y/N]"
        if ($overwrite -notmatch '^[Yy]$') {
          Write-Color "Operation cancelled" "Red"
          exit 1
        }
      }
    }
  } else {
    if ($AutoYes) {
      Write-Color "Auto-confirming overwrite (--yes flag)" "Yellow"
      Remove-Item $TargetDir -Recurse -Force
    } else {
      $overwrite = Read-Host "Directory '$SkillName' already exists. Overwrite? [y/N]"
      if ($overwrite -notmatch '^[Yy]$') {
        Write-Color "Operation cancelled" "Red"
        exit 1
      }
      Remove-Item $TargetDir -Recurse -Force
    }
  }
}

# 创建目录
New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null

$SkillTitle = ConvertTo-TitleCase $SkillName

Write-Color "Creating skill '$SkillName'..." "Cyan"

# 创建 SKILL.md
$skillContent = @"
``````skill
---
name: $SkillName
description: $Description
metadata:
  author: $Author
  version: "1.0.0"
  argument-hint: <argument>
---

# $SkillTitle

$Description

## 用法

``````
/$SkillName <argument>
``````

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
| ``argument`` | 参数描述 | - |

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

``````
/$SkillName example-input
``````

### 高级用法

``````
/$SkillName complex-input --option value
``````

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
``````
"@

$skillContent | Out-File -FilePath (Join-Path $TargetDir "SKILL.md") -Encoding utf8

# 根据类型创建额外文件
if ($Type -in @('scripted', 'full')) {
  $scriptsDir = Join-Path $TargetDir "scripts"
  New-Item -ItemType Directory -Path $scriptsDir -Force | Out-Null

  # 创建 main.sh
  $mainSh = @'
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
'@
  $mainSh | Out-File -FilePath (Join-Path $scriptsDir "main.sh") -Encoding utf8 -NoNewline

  # 创建 main.ps1
  $mainPs1 = @'
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
'@
  $mainPs1 | Out-File -FilePath (Join-Path $scriptsDir "main.ps1") -Encoding utf8 -NoNewline
}

if ($Type -eq 'full') {
  # 创建 examples 目录
  $examplesDir = Join-Path $TargetDir "examples"
  New-Item -ItemType Directory -Path $examplesDir -Force | Out-Null
  
  $exampleContent = @"
# $SkillTitle - 使用示例

## 示例 1：基本用法

``````
/$SkillName basic-input
``````

**预期结果**：描述预期输出

---

## 示例 2：高级用法

``````
/$SkillName advanced-input --option value
``````

**预期结果**：描述预期输出

---

## 示例 3：错误处理

``````
/$SkillName invalid-input
``````

**预期结果**：应该显示友好的错误提示
"@
  $exampleContent | Out-File -FilePath (Join-Path $examplesDir "example-usage.md") -Encoding utf8

  # 创建 tests 目录
  $testsDir = Join-Path $TargetDir "tests"
  New-Item -ItemType Directory -Path $testsDir -Force | Out-Null
  
  $testContent = @'
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
'@
  $testContent | Out-File -FilePath (Join-Path $testsDir "test-skill.sh") -Encoding utf8 -NoNewline
}

Write-Host ""
Write-Color "✓ Skill '$SkillName' created successfully!" "Green"
Write-Host ""
Write-Host "Created files:"
Write-Host "  $TargetDir\SKILL.md"
if ($Type -in @('scripted', 'full')) {
  Write-Host "  $TargetDir\scripts\main.sh"
  Write-Host "  $TargetDir\scripts\main.ps1"
}
if ($Type -eq 'full') {
  Write-Host "  $TargetDir\examples\example-usage.md"
  Write-Host "  $TargetDir\tests\test-skill.sh"
}
Write-Host ""
Write-Color "Next steps:" "Cyan"
Write-Host "  1. Edit SKILL.md to customize your skill"
Write-Host "  2. Add your logic to scripts/ (if applicable)"
Write-Host "  3. Test your skill with different inputs"
