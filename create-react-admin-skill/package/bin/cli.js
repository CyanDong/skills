#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

const log = {
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
};

const DEFAULTS = {
  appName: "中后台管理系统",
  packageManager: "npm",
};

function parseArgs(args) {
  const result = {
    projectName: "",
    appName: "",
    packageManager: "",
    noInstall: false,
    yes: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "-h":
      case "--help":
        result.help = true;
        break;
      case "-a":
      case "--app-name":
        result.appName = args[++i] || "";
        break;
      case "-p":
      case "--package-manager":
        result.packageManager = args[++i] || "";
        break;
      case "--no-install":
        result.noInstall = true;
        break;
      case "-y":
      case "--yes":
        result.yes = true;
        break;
      default:
        if (!arg.startsWith("-") && !result.projectName) {
          result.projectName = arg;
        }
        break;
    }
  }

  return result;
}

function showHelp() {
  console.log(`
${colors.bold}create-react-admin-skill${colors.reset} - 快速创建 React + TS + Antd 中后台项目

${colors.bold}用法:${colors.reset}
  npx create-react-admin-skill [project-name] [options]
  npx create-react-admin-skill .                        # 在当前目录创建

${colors.bold}选项:${colors.reset}
  -a, --app-name <name>         应用名称 (默认: "${DEFAULTS.appName}")
  -p, --package-manager <pm>    包管理器: npm|pnpm|yarn (默认: "${DEFAULTS.packageManager}")
  --no-install                  不自动安装依赖
  -y, --yes                     跳过确认提示
  -h, --help                    显示帮助信息

${colors.bold}示例:${colors.reset}
  npx create-react-admin-skill my-admin
  npx create-react-admin-skill my-admin -a "运营后台" -p npm
  npx create-react-admin-skill . --no-install -y
`);
}

function runCommand(command, cwd) {
  execSync(command, { cwd, stdio: "inherit" });
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function validateProjectName(name) {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    log.error(
      "错误: 项目名称必须以小写字母开头，只能包含小写字母、数字和连字符",
    );
    return false;
  }
  return true;
}

function validatePackageManager(pm) {
  return ["npm", "pnpm", "yarn"].includes(pm);
}

function addDepsCommand(pm) {
  if (pm === "yarn") {
    return "yarn add antd @ant-design/icons react-router-dom";
  }
  return `${pm} add antd @ant-design/icons react-router-dom`;
}

function escapeTemplateLiteral(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function addDepsToPackageJson(projectDir) {
  const pkgPath = path.join(projectDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  pkg.dependencies = pkg.dependencies || {};
  pkg.dependencies.antd = "^5.27.1";
  pkg.dependencies["@ant-design/icons"] = "^6.0.1";
  pkg.dependencies["react-router-dom"] = "^7.9.2";

  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}

function clearCurrentDirectory(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    if (entry === ".git") {
      continue;
    }
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
}

function replaceTemplateFiles(projectDir, appNameRaw) {
  const appName = escapeTemplateLiteral(appNameRaw);

  writeFile(
    path.join(projectDir, "src/main.tsx"),
    `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
`,
  );

  writeFile(
    path.join(projectDir, "src/App.tsx"),
    `import { App as AntdApp } from 'antd';
import { useRoutes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { routes } from './router';

function App() {
  const { isLoading } = useAuth();
  const element = useRoutes(routes);

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>加载中...</div>;
  }

  return <AntdApp>{element}</AntdApp>;
}

export default App;
`,
  );

  writeFile(
    path.join(projectDir, "src/router/index.tsx"),
    `import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'users',
        element: <Users />
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
];
`,
  );

  writeFile(
    path.join(projectDir, "src/layouts/AdminLayout.tsx"),
    `import { Button, Layout, Menu, Space, Typography, theme } from 'antd';
import { DashboardOutlined, TeamOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const APP_NAME = '${appName}';

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/users', icon: <TeamOutlined />, label: '用户管理' }
];

function AdminLayout() {
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="light" style={{ borderRight: \`1px solid \${token.colorBorder}\` }}>
        <div style={{ padding: 16 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {APP_NAME}
          </Typography.Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: \`1px solid \${token.colorBorder}\`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 24
          }}
        >
          <Typography.Text>欢迎使用 {APP_NAME}</Typography.Text>
          <Space>
            <Typography.Text type="secondary">\${user?.username || '用户'}</Typography.Text>
            <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout}>
              登出
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: 16 }}>
          <div
            style={{
              minHeight: 'calc(100vh - 96px)',
              padding: 16,
              background: token.colorBgContainer,
              borderRadius: token.borderRadius,
              border: \`1px solid \${token.colorBorder}\`
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
`,
  );

  writeFile(
    path.join(projectDir, "src/pages/Dashboard.tsx"),
    `import { Card, Col, Row, Statistic } from 'antd';

function Dashboard() {
  return (
    <div>
      <h2>仪表盘</h2>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="今日活跃用户" value={1234} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="新增订单" value={87} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待处理工单" value={19} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="异常告警" value={3} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
`,
  );

  writeFile(
    path.join(projectDir, "src/pages/Users.tsx"),
    `import { Space, Table, Tag, Typography } from 'antd';

type UserRecord = {
  key: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
};

const data: UserRecord[] = [
  { key: '1', name: '张三', role: '管理员', status: 'active' },
  { key: '2', name: '李四', role: '运营', status: 'active' },
  { key: '3', name: '王五', role: '访客', status: 'inactive' }
];

function Users() {
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        用户管理
      </Typography.Title>
      <Table
        rowKey="key"
        dataSource={data}
        columns={[
          { title: '姓名', dataIndex: 'name' },
          { title: '角色', dataIndex: 'role' },
          {
            title: '状态',
            dataIndex: 'status',
            render: (status: UserRecord['status']) =>
              status === 'active' ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>
          }
        ]}
      />
    </Space>
  );
}

export default Users;
`,
  );

  writeFile(
    path.join(projectDir, "src/pages/Login.tsx"),
    `import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormValues {
  username: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form] = Form.useForm();

  const onFinish = (values: LoginFormValues) => {
    // 简单的本地认证演示（生产环境应调用真实的服务端认证）
    if (values.username && values.password) {
      login({ username: values.username });
      message.success('登录成功！');
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <Typography.Title level={2} style={{ marginBottom: 24, textAlign: 'center' }}>登录系统</Typography.Title>
        <Form
          layout="vertical"
          onFinish={onFinish}
          form={form}
          initialValues={{ username: 'admin', password: '123456' }}
        >
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="默认: admin" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="默认: 123456" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
        <Typography.Text type="secondary" style={{ marginTop: 16, display: 'block', textAlign: 'center', fontSize: 12 }}>
          演示账号: admin / 123456
        </Typography.Text>
      </Card>
    </div>
  );
}

export default Login;
`,
  );

  writeFile(
    path.join(projectDir, "src/pages/NotFound.tsx"),
    `import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="页面不存在"
      extra={<Button onClick={() => navigate('/dashboard')}>返回首页</Button>}
    />
  );
}

export default NotFound;
`,
  );

  writeFile(
    path.join(projectDir, "src/index.css"),
    `:root {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  width: 100%;
  min-height: 100%;
}

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #f0f5ff 0%, #f6ffed 100%);
}

.login-card {
  width: 360px;
}
`,
  );

  const appCssPath = path.join(projectDir, "src/App.css");
  if (fs.existsSync(appCssPath)) {
    fs.rmSync(appCssPath);
  }

  writeFile(
    path.join(projectDir, "src/contexts/AuthContext.tsx"),
    `import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  username: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 初始化时检查本地存储中的认证状态
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
`,
  );
}

async function ask(rl, question, defaultValue = "") {
  const prompt = defaultValue
    ? `${question} [${defaultValue}]: `
    : `${question}: `;
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim() || defaultValue));
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const config = {
    projectName: args.projectName,
    appName: args.appName,
    packageManager: args.packageManager,
    noInstall: args.noInstall,
    isCurrentDir: false,
    yes: args.yes,
  };

  try {
    if (!config.projectName) {
      const useCurrentDir = await ask(rl, "是否在当前目录创建项目? (y/N)", "N");
      if (useCurrentDir.toLowerCase() === "y") {
        config.projectName = path.basename(process.cwd());
        config.isCurrentDir = true;
      } else {
        config.projectName = await ask(rl, "项目名称", "admin-app");
      }
    } else if (config.projectName === ".") {
      config.projectName = path.basename(process.cwd());
      config.isCurrentDir = true;
    }

    if (!validateProjectName(config.projectName)) {
      process.exit(1);
    }

    if (!config.appName) {
      config.appName = await ask(rl, "应用名称", DEFAULTS.appName);
    }

    if (!config.packageManager) {
      config.packageManager = await ask(
        rl,
        "包管理器 (npm/pnpm/yarn)",
        DEFAULTS.packageManager,
      );
    }

    if (!validatePackageManager(config.packageManager)) {
      log.error(
        `错误: 无效包管理器 '${config.packageManager}'，必须是 npm、pnpm 或 yarn`,
      );
      process.exit(1);
    }

    const targetDir = config.isCurrentDir
      ? process.cwd()
      : path.join(process.cwd(), config.projectName);

    if (fs.existsSync(targetDir)) {
      const files = fs.readdirSync(targetDir).filter((f) => f !== ".git");
      if (files.length > 0 && !config.yes) {
        const overwrite = await ask(rl, "目录不为空，是否覆盖? (y/N)", "N");
        if (overwrite.toLowerCase() !== "y") {
          log.warn("操作已取消");
          return;
        }
      }

      if (config.isCurrentDir) {
        clearCurrentDirectory(targetDir);
      } else {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
    }

    rl.close();

    log.info(`\n创建 React 管理后台项目 '${config.projectName}'...`);

    // 创建目标目录（如果不存在）
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 始终在目标目录内运行 create-vite，使用 '.' 作为目标
    runCommand(
      "npx --yes create-vite@latest . --template react-ts --no-interactive",
      targetDir,
    );

    replaceTemplateFiles(targetDir, config.appName);

    if (config.noInstall) {
      addDepsToPackageJson(targetDir);
      log.warn("已跳过依赖安装，请稍后手动执行依赖安装命令。");
    } else {
      runCommand(addDepsCommand(config.packageManager), targetDir);
    }

    console.log("");
    log.success(`✓ 项目 '${config.projectName}' 创建成功!`);
    console.log("");
    log.info("后续步骤:");
    console.log(`  1. cd ${config.isCurrentDir ? "." : config.projectName}`);
    console.log(`  2. ${config.packageManager} run dev`);
    console.log("");
  } catch (error) {
    rl.close();
    log.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

main();
