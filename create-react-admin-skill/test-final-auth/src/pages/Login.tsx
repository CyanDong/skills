import { Button, Card, Form, Input, Typography, message } from 'antd';
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
