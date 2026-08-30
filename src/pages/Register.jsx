import { useState } from 'react';
import { Button, Card, Form, Input, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, UserAddOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async ({ username, password }) => {
    setError(null);
    setSubmitting(true);
    try {
      await register(username, password);
      navigate('/clusters', { replace: true });
    } catch (err) {
      // register_view returns 400 with {detail: "..."} for both a taken
      // username and a password that fails Django's validators -- the api
      // client already surfaces that as err.message.
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card style={{ width: 360 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <UserAddOutlined style={{ fontSize: 32, color: '#e0914f' }} />
          <Typography.Title level={3} style={{ margin: 0 }}>
            Create account
          </Typography.Title>
        </div>
        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} autoFocus />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]} hasFeedback>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm password"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Passwords do not match.'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<SafetyOutlined />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={submitting} icon={<UserAddOutlined />}>
              Create account
            </Button>
          </Form.Item>
        </Form>
        <Typography.Paragraph style={{ textAlign: 'center', marginBottom: 0 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
