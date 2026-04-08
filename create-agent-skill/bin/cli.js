#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
};

// Default values
const DEFAULTS = {
  description: 'A custom agent skill',
  author: 'anonymous',
  type: 'basic'
};

// Parse command line arguments
function parseArgs(args) {
  const result = {
    skillName: '',
    description: '',
    author: '',
    type: '',
    yes: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-h':
      case '--help':
        result.help = true;
        break;
      case '-d':
      case '--description':
        result.description = args[++i] || '';
        break;
      case '-a':
      case '--author':
        result.author = args[++i] || '';
        break;
      case '-t':
      case '--type':
        result.type = args[++i] || '';
        break;
      case '-y':
      case '--yes':
        result.yes = true;
        break;
      default:
        if (!arg.startsWith('-') && !result.skillName) {
          result.skillName = arg;
        }
    }
  }

  return result;
}

// Show help message
function showHelp() {
  console.log(`
${colors.bold}create-agent-skills${colors.reset} - 快速创建 AI Agent Skills 模板

${colors.bold}用法:${colors.reset}
  npx create-agent-skills [skill-name] [options]
  npx create-agent-skills .                      # 在当前目录创建

${colors.bold}选项:${colors.reset}
  -d, --description <desc>  Skill 描述 (默认: "${DEFAULTS.description}")
  -a, --author <name>       作者名称 (默认: "${DEFAULTS.author}")
  -t, --type <type>         Skill 类型: basic|scripted|full (默认: "${DEFAULTS.type}")
  -y, --yes                 跳过确认提示
  -h, --help                显示帮助信息

${colors.bold}Skill 类型:${colors.reset}
  basic     - 仅 SKILL.md
  scripted  - SKILL.md + scripts/
  full      - SKILL.md + scripts/ + examples/ + tests/

${colors.bold}示例:${colors.reset}
  npx create-agent-skills my-skill
  npx create-agent-skills my-skill -d "我的 Skill" -a "developer" -t full
  npx create-agent-skills . -y
`);
}

// Create readline interface for prompts
function createPrompt() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Ask a question
function ask(rl, question, defaultValue = '') {
  const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

// Validate skill name
function validateSkillName(name) {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    log.error('错误: Skill 名称必须以小写字母开头，只能包含小写字母、数字和连字符');
    return false;
  }
  return true;
}

// Convert to title case
function toTitleCase(str) {
  return str.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Generate SKILL.md content
function generateSkillMd(config) {
  return `\`\`\`skill
---
name: ${config.skillName}
description: ${config.description}
metadata:
  author: ${config.author}
  version: "1.0.0"
  argument-hint: <argument>
---

# ${config.title}

${config.description}

## 用法

\`\`\`
/${config.skillName} <argument>
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
/${config.skillName} example-input
\`\`\`

### 高级用法

\`\`\`
/${config.skillName} complex-input --option value
\`\`\`

---

## 错误处理

| 错误 | 处理方式 |
|------|---------|
| 参数无效 | 提示正确格式 |
| 文件不存在 | 建议创建或检查路径 |
| 权限不足 | 说明需要的权限 |
\`\`\`
`;
}

// Generate main.sh content
function generateMainSh() {
  return `#!/usr/bin/env bash
set -e

# Colors
RED='\\033[0;31m'
GREEN='\\033[0;32m'
CYAN='\\033[0;36m'
NC='\\033[0m'

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

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help) show_help ;;
    -*) echo -e "\${RED}Unknown option: $1\${NC}" >&2; exit 1 ;;
    *) shift ;;
  esac
done

echo -e "\${CYAN}Executing skill...\${NC}"

# TODO: Add your logic here

echo -e "\${GREEN}Done!\${NC}"
`;
}

// Generate main.ps1 content
function generateMainPs1() {
  return `param(
  [switch]$Help
)

function Write-Color {
  param([string]$Text, [string]$Color = "White")
  Write-Host $Text -ForegroundColor $Color
}

if ($Help) {
  Write-Host @"
Usage: .\\main.ps1 [options]

Options:
  -Help    Show this help message
"@
  exit 0
}

Write-Color "Executing skill..." "Cyan"

# TODO: Add your logic here

Write-Color "Done!" "Green"
`;
}

// Generate example-usage.md content
function generateExampleMd(config) {
  return `# ${config.title} - 使用示例

## 示例 1：基本用法

\`\`\`
/${config.skillName} basic-input
\`\`\`

**预期结果**：描述预期输出

---

## 示例 2：高级用法

\`\`\`
/${config.skillName} advanced-input --option value
\`\`\`

**预期结果**：描述预期输出

---

## 示例 3：错误处理

\`\`\`
/${config.skillName} invalid-input
\`\`\`

**预期结果**：应该显示友好的错误提示
`;
}

// Generate test-skill.sh content
function generateTestSh() {
  return `#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

echo "Running tests for skill..."

# Test 1: Help command
echo "Test 1: Help command"
bash "$SKILL_DIR/scripts/main.sh" --help && echo "PASS" || echo "FAIL"

# Test 2: Basic execution
echo "Test 2: Basic execution"
bash "$SKILL_DIR/scripts/main.sh" && echo "PASS" || echo "FAIL"

echo "All tests completed!"
`;
}

// Create skill files
function createSkill(targetDir, config) {
  // Create directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Create SKILL.md
  fs.writeFileSync(
    path.join(targetDir, 'SKILL.md'),
    generateSkillMd(config),
    'utf8'
  );

  // Create scripts for scripted and full types
  if (config.type === 'scripted' || config.type === 'full') {
    const scriptsDir = path.join(targetDir, 'scripts');
    fs.mkdirSync(scriptsDir, { recursive: true });
    
    fs.writeFileSync(path.join(scriptsDir, 'main.sh'), generateMainSh(), 'utf8');
    fs.writeFileSync(path.join(scriptsDir, 'main.ps1'), generateMainPs1(), 'utf8');
    
    // Make shell script executable
    try {
      fs.chmodSync(path.join(scriptsDir, 'main.sh'), '755');
    } catch (e) {
      // Ignore chmod errors on Windows
    }
  }

  // Create examples and tests for full type
  if (config.type === 'full') {
    const examplesDir = path.join(targetDir, 'examples');
    const testsDir = path.join(targetDir, 'tests');
    
    fs.mkdirSync(examplesDir, { recursive: true });
    fs.mkdirSync(testsDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(examplesDir, 'example-usage.md'),
      generateExampleMd(config),
      'utf8'
    );
    
    fs.writeFileSync(path.join(testsDir, 'test-skill.sh'), generateTestSh(), 'utf8');
    
    try {
      fs.chmodSync(path.join(testsDir, 'test-skill.sh'), '755');
    } catch (e) {
      // Ignore chmod errors on Windows
    }
  }
}

// Main function
async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  let config = {
    skillName: args.skillName,
    description: args.description,
    author: args.author,
    type: args.type,
    title: ''
  };

  const rl = createPrompt();

  try {
    // Interactive mode if no skill name provided
    if (!config.skillName) {
      const useCurrentDir = await ask(rl, '是否在当前目录创建 Skill? (y/N)', 'N');
      
      if (useCurrentDir.toLowerCase() === 'y') {
        config.skillName = path.basename(process.cwd());
        config.isCurrentDir = true;
      } else {
        config.skillName = await ask(rl, 'Skill 名称', 'my-skill');
        config.isCurrentDir = false;
      }
    } else if (config.skillName === '.') {
      config.skillName = path.basename(process.cwd());
      config.isCurrentDir = true;
    } else {
      config.isCurrentDir = false;
    }

    // Validate skill name
    if (!validateSkillName(config.skillName)) {
      process.exit(1);
    }

    // Get description
    if (!config.description) {
      config.description = await ask(rl, 'Skill 描述', DEFAULTS.description);
    }

    // Get author
    if (!config.author) {
      config.author = await ask(rl, '作者名称', DEFAULTS.author);
    }

    // Get type
    if (!config.type) {
      config.type = await ask(rl, 'Skill 类型 (basic/scripted/full)', DEFAULTS.type);
    }

    // Validate type
    if (!['basic', 'scripted', 'full'].includes(config.type)) {
      log.error(`错误: 无效的 Skill 类型 '${config.type}'，必须是: basic, scripted, 或 full`);
      process.exit(1);
    }

    // Set title
    config.title = toTitleCase(config.skillName);

    // Determine target directory
    const targetDir = config.isCurrentDir 
      ? process.cwd() 
      : path.join(process.cwd(), config.skillName);

    // Check if directory exists and not empty
    if (fs.existsSync(targetDir)) {
      const files = fs.readdirSync(targetDir).filter(f => f !== '.git');
      if (files.length > 0 && !args.yes) {
        const overwrite = await ask(rl, '目录不为空，是否覆盖? (y/N)', 'N');
        if (overwrite.toLowerCase() !== 'y') {
          log.warn('操作已取消');
          process.exit(0);
        }
      }
    }

    rl.close();

    // Create skill
    log.info(`\n创建 Skill '${config.skillName}'...`);
    createSkill(targetDir, config);

    // Success message
    console.log('');
    log.success(`✓ Skill '${config.skillName}' 创建成功!`);
    console.log('');
    console.log('创建的文件:');
    console.log(`  ${targetDir}/SKILL.md`);
    
    if (config.type === 'scripted' || config.type === 'full') {
      console.log(`  ${targetDir}/scripts/main.sh`);
      console.log(`  ${targetDir}/scripts/main.ps1`);
    }
    
    if (config.type === 'full') {
      console.log(`  ${targetDir}/examples/example-usage.md`);
      console.log(`  ${targetDir}/tests/test-skill.sh`);
    }

    console.log('');
    log.info('后续步骤:');
    console.log('  1. 编辑 SKILL.md 完善你的 Skill 内容');
    console.log('  2. 根据需要修改 scripts/ 中的脚本');
    console.log('  3. 测试你的 Skill');
    console.log('');

  } catch (error) {
    rl.close();
    log.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

main();
