import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Switch, Popconfirm, Typography, message, Tag } from 'antd';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';

export default function Clusters() {
  const { user } = useAuth();
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api
      .listClusters()
      .then(setClusters)
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (values) => {
    try {
      await api.createCluster(values);
      message.success('Cluster created.');
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteCluster(id);
      message.success('Cluster deleted.');
      load();
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Description', dataIndex: 'description' },
    { title: 'API server', dataIndex: 'api_server' },
    {
      title: 'Default',
      dataIndex: 'is_default',
      render: (value) => (value ? <Tag color="green">default</Tag> : null),
    },
    ...(user.is_staff
      ? [
          {
            title: '',
            key: 'actions',
            render: (_, record) => (
              <Popconfirm title="Delete this cluster?" onConfirm={() => handleDelete(record.id)}>
                <Button danger size="small">
                  Delete
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Clusters
        </Typography.Title>
        {user.is_staff && <Button type="primary" onClick={() => setModalOpen(true)}>Add cluster</Button>}
      </div>

      <Table rowKey="id" columns={columns} dataSource={clusters} loading={loading} />

      <Modal
        title="Add cluster"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form layout="vertical" form={form} onFinish={handleCreate}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item
            name="kubeconfig"
            label="Kubeconfig"
            extra="Leave blank to use the backend's local/in-cluster default kubeconfig."
          >
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item name="is_default" label="Default cluster" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
