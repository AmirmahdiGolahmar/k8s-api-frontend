import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, Select, Popconfirm, Typography, message, Tag } from 'antd';
import { api } from '../api/client';

const STATUS_COLORS = { active: 'green', deleting: 'orange', missing: 'red' };

export default function Apps() {
  const [clusters, setClusters] = useState([]);
  const [clusterId, setClusterId] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Namespace', dataIndex: 'namespace' },
    { title: 'Image', dataIndex: 'image' },
    { title: 'Replicas', dataIndex: 'replicas' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value) => <Tag color={STATUS_COLORS[value] ?? 'default'}>{value}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm title="Delete this app?" onConfirm={() => handleDelete(record.id)}>
          <Button danger size="small">
            Delete
          </Button>
        </Popconfirm>
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
      >
        <Form layout="vertical" form={form} onFinish={handleCreate} initialValues={{ image: 'nginx:latest', replicas: 1 }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Lowercase alphanumeric and "-" only.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="namespace"
            label="Namespace"
            rules={[{ required: true, pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Lowercase alphanumeric and "-" only.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="image" label="Image">
            <Input />
          </Form.Item>
          <Form.Item name="replicas" label="Replicas">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
