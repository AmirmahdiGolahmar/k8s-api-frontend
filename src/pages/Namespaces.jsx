import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Select, Popconfirm, Typography, message, Tag, Space } from 'antd';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import AccessModal from '../components/AccessModal';

export default function Namespaces() {
  const { user } = useAuth();
  const [clusters, setClusters] = useState([]);
  const [clusterId, setClusterId] = useState(null);
  const [namespaces, setNamespaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [accessRecord, setAccessRecord] = useState(null);
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

  useEffect(() => {
    if (user.is_staff) {
      api.listUsers().then(setUsers).catch((err) => message.error(err.message));
    }
  }, [user.is_staff]);

  const load = (id) => {
    if (!id) return;
    setLoading(true);
    api
      .listNamespaces(id)
      .then(setNamespaces)
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(clusterId), [clusterId]);

  const handleCreate = async ({ name }) => {
    try {
      await api.createNamespace(clusterId, name);
      message.success('Namespace created.');
      setModalOpen(false);
      form.resetFields();
      load(clusterId);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteNamespace(id);
      message.success('Namespace deleted.');
      load(clusterId);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleSaveAccess = async (values) => {
    try {
      // NamespaceAccessView expects allowed_user_ids, not allowed_users --
      // different key name than the Cluster endpoint's.
      await api.updateNamespaceAccess(accessRecord.id, {
        is_accessible: values.is_accessible,
        allowed_user_ids: values.allowed_users,
      });
      message.success('Access updated.');
      setAccessRecord(null);
      load(clusterId);
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    ...(user.is_staff
      ? [
          {
            title: 'Access',
            dataIndex: 'is_accessible',
            render: (value, record) =>
              value ? (
                <Tag color="green">owner</Tag>
              ) : (
                <Tag color="orange">
                  restricted{record.allowed_users?.length ? ` (${record.allowed_users.length})` : ''}
                </Tag>
              ),
          },
        ]
      : []),
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {user.is_staff && (
            <Button size="small" onClick={() => setAccessRecord(record)}>
              Access
            </Button>
          )}
          <Popconfirm title="Delete this namespace?" onConfirm={() => handleDelete(record.id)}>
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Namespaces
        </Typography.Title>
        <Button type="primary" onClick={() => setModalOpen(true)} disabled={!clusterId}>
          Add namespace
        </Button>
      </div>

      <Select
        style={{ width: 280, marginBottom: 16 }}
        placeholder="Select a cluster"
        value={clusterId}
        onChange={setClusterId}
        options={clusters.map((c) => ({ value: c.id, label: c.name }))}
      />

      <Table rowKey="id" columns={columns} dataSource={namespaces} loading={loading} />

      <Modal
        title="Add namespace"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form layout="vertical" form={form} onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Lowercase alphanumeric and "-" only.' }]}
          >
            <Input />
          </Form.Item>
        </Form>
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
