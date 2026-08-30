import { Layout, Menu, Button, Typography, Space, Tag } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const { Header, Sider, Content } = Layout;

const NAV_ITEMS = [
  { key: '/clusters', label: 'Clusters' },
  { key: '/namespaces', label: 'Namespaces' },
  { key: '/apps', label: 'Apps' },
  { key: '/backups', label: 'Backups' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: 'white', fontWeight: 600, fontSize: 18, padding: 16 }}>k8s-api</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={NAV_ITEMS}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <Space>
            <Typography.Text>{user.username}</Typography.Text>
            {user.is_staff && <Tag color="blue">admin</Tag>}
            <Button onClick={handleLogout}>Log out</Button>
          </Space>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
