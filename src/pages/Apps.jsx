import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, Select, Popconfirm, Typography, message, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import ImageCatalogPicker from '../components/ImageCatalogPicker';

const STATUS_COLORS = { active: 'green', deleting: 'orange', missing: 'red' };

export default function Apps() {
  const { user } = useAuth();
  const [clusters, setClusters] = useState([]);
  const [clusterId, setClusterId] = useState(null);
  const [namespaces, setNamespaces] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    api
      .listClusters()
      .then((data) => {
        setClusters(data);
        if (data.length > 0) setClusterId(data[0].id);
      })
      .catch((err) => message.error(err.message));
  }, []);

  const load = (id) => {
    if (!id) return;
    setLoading(true);
    api
      .listApps(id)
      .then(setApps)
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(clusterId), [clusterId]);

  // Same-owner namespaces the current user can actually deploy an app
  // into -- the backend already scopes GET /namespace/ to what this user
  // owns (or everything, if staff), so the dropdown just reflects that.
  useEffect(() => {
    if (!clusterId) {
      setNamespaces([]);
      return;
    }
    api
      .listNamespaces(clusterId)
      .then(setNamespaces)
      .catch((err) => message.error(err.message));
  }, [clusterId]);

  const handleCreate = async (values) => {
    try {
      await api.createApp({ cluster_id: clusterId, ...values });
      message.success('App created.');
      setModalOpen(false);
      form.resetFields();
      load(clusterId);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteApp(id);
      message.success('App deleted.');
      load(clusterId);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleRefresh = async (id) => {
    setRefreshingId(id);
    try {
      // Checks the real cluster on demand rather than just re-reading the
      // DB -- clusters.tasks.sync_app_status only runs every 2 minutes,
      // this is what makes the button actually "live".
      const updated = await api.refreshAppStatus(id);
      setApps((current) => current.map((app) => (app.id === id ? updated : app)));
    } catch (err) {
      message.error(err.message);
    } finally {
      setRefreshingId(null);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Namespace', dataIndex: 'namespace' },
    { title: 'Image', dataIndex: 'image' },
    { title: 'Replicas', dataIndex: 'replicas' },
    ...(user.is_staff ? [{ title: 'Owner', dataIndex: 'owner_username', render: (v) => v ?? '—' }] : []),
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value) => <Tag color={STATUS_COLORS[value] ?? 'default'}>{value}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            loading={refreshingId === record.id}
            onClick={() => handleRefresh(record.id)}
          >
            Reload
          </Button>
          <Popconfirm title="Delete this app?" onConfirm={() => handleDelete(record.id)}>
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Apps
        </Typography.Title>
        <Button type="primary" onClick={() => setModalOpen(true)} disabled={!clusterId}>
          Add app
        </Button>
      </div>

      <Select
        style={{ width: 280, marginBottom: 16 }}
        placeholder="Select a cluster"
        value={clusterId}
        onChange={setClusterId}
        options={clusters.map((c) => ({ value: c.id, label: c.name }))}
      />

      <Table rowKey="id" columns={columns} dataSource={apps} loading={loading} />

      <Modal
        title="Add app"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
        width={520}
      >
        <Form layout="vertical" form={form} onFinish={handleCreate} initialValues={{ image: 'nginx:latest', replicas: 1 }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Lowercase alphanumeric and "-" only.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="namespace" label="Namespace" rules={[{ required: true }]}>
            <Select
              placeholder={namespaces.length ? 'Select a namespace' : 'No namespaces available -- create one first'}
              options={namespaces.map((n) => ({ value: n.name, label: n.name }))}
            />
          </Form.Item>
          <Form.Item name="image" label="Image" rules={[{ required: true }]}>
            <ImageCatalogPicker />
          </Form.Item>
          <Form.Item name="replicas" label="Replicas">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
