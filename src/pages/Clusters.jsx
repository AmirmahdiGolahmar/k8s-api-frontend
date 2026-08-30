import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Switch, Popconfirm, Typography, message, Tag, Descriptions, Space } from 'antd';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import AccessModal from '../components/AccessModal';

export default function Clusters() {
  const { user } = useAuth();
  const [clusters, setClusters] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [accessRecord, setAccessRecord] = useState(null);
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

  // Only staff can act on this, and only staff can even call it -- no
  // point fetching for a regular user who'll never see the Access modal.
  useEffect(() => {
    if (user.is_staff) {
      api.listUsers().then(setUsers).catch((err) => message.error(err.message));
    }
  }, [user.is_staff]);

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

  const handleSaveAccess = async (values) => {
    try {
      await api.updateClusterAccess(accessRecord.id, values);
      message.success('Access updated.');
      setAccessRecord(null);
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
    ...(user.is_staff ? [{ title: 'Created by', dataIndex: 'created_by_username', render: (v) => v ?? '—' }] : []),
    {
      title: 'Access',
      dataIndex: 'is_accessible',
      render: (value, record) =>
        value ? (
          <Tag color="green">everyone</Tag>
        ) : (
          <Tag color="orange">restricted{record.allowed_users?.length ? ` (${record.allowed_users.length})` : ''}</Tag>
        ),
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => setDetail(record)}>
            Info
          </Button>
          {user.is_staff && (
            <>
              <Button size="small" onClick={() => setAccessRecord(record)}>
                Access
              </Button>
              <Popconfirm title="Delete this cluster?" onConfirm={() => handleDelete(record.id)}>
                <Button danger size="small">
                  Delete
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
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
            extra="Leave blank to use the backend's local/in-cluster default kubeconfig. Write-only: it can't be viewed again after this, even by staff."
          >
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item name="is_default" label="Default cluster" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={detail?.name} open={!!detail} onCancel={() => setDetail(null)} footer={null}>
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Name">{detail.name}</Descriptions.Item>
            <Descriptions.Item label="Description">{detail.description || '—'}</Descriptions.Item>
            <Descriptions.Item label="API server">{detail.api_server || '—'}</Descriptions.Item>
            <Descriptions.Item label="Default cluster">{detail.is_default ? 'Yes' : 'No'}</Descriptions.Item>
            <Descriptions.Item label="Created by">{detail.created_by_username ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Created">{detail.created_at}</Descriptions.Item>
            <Descriptions.Item label="Updated">{detail.updated_at}</Descriptions.Item>
            <Descriptions.Item label="Kubeconfig">
              Not shown — write-only, never returned by the API once submitted.
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <AccessModal
        open={!!accessRecord}
        title={accessRecord ? `Access — ${accessRecord.name}` : ''}
        record={accessRecord}
        users={users}
        onCancel={() => setAccessRecord(null)}
        onSave={handleSaveAccess}
      />
    </div>
  );
}
