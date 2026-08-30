import { useState } from 'react';
import { Button, Card, Form, Input, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, DeploymentUnitOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async ({ username, password }) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(location.state?.from ?? '/clusters', { replace: true });
    } catch (err) {
      setError(err.status === 401 ? 'Invalid username or password.' : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card style={{ width: 360 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <DeploymentUnitOutlined style={{ fontSize: 32, color: '#9d7cf5' }} />
          <Typography.Title level={3} style={{ margin: 0 }}>
            k8s-api
          </Typography.Title>
        </div>
        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} autoFocus />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={submitting} icon={<LoginOutlined />}>
              Log in
            </Button>
          </Form.Item>
        </Form>
        <Typography.Paragraph style={{ textAlign: 'center', marginBottom: 0 }}>
          No account? <Link to="/register">Sign up</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
