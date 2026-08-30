import { Layout, Menu, Button, Typography, Space, Tag, Avatar } from 'antd';
import {
  ClusterOutlined,
  PartitionOutlined,
  AppstoreOutlined,
  CloudUploadOutlined,
  DeploymentUnitOutlined,
  LogoutOutlined,
  UserOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const { Header, Sider, Content } = Layout;

const NAV_ITEMS = [
  { key: '/clusters', label: 'Clusters', icon: <ClusterOutlined /> },
  { key: '/namespaces', label: 'Namespaces', icon: <PartitionOutlined /> },
  { key: '/apps', label: 'Apps', icon: <AppstoreOutlined /> },
  { key: '/backups', label: 'Backups', icon: <CloudUploadOutlined /> },
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#f0b380',
            fontWeight: 600,
            fontSize: 18,
            padding: '18px 20px',
          }}
        >
          <DeploymentUnitOutlined style={{ fontSize: 22 }} />
          k8s-api
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={NAV_ITEMS}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingInline: 24 }}>
          <Space>
            <Avatar size="small" icon={<UserOutlined />} style={{ background: '#e0914f' }} />
            <Typography.Text>{user.username}</Typography.Text>
            {user.is_staff && (
              <Tag icon={<CrownOutlined />} color="gold">
                admin
              </Tag>
            )}
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              Log out
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
