import { App as AntdApp } from 'antd';
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
