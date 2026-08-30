import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Select, Popconfirm, Typography, message, Tag, Space, Segmented } from 'antd';
import {
  PartitionOutlined,
  PlusOutlined,
  SafetyOutlined,
  DeleteOutlined,
  GlobalOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
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

  // Staff can switch to seeing every namespace that actually exists in the
  // cluster (kube-system, default, anything created outside this app) --
  // that view reads straight from k8s and has no id/owner/delete/access.
  // Staff default to that full view (not everyone needs to discover the
  // toggle to see kube-system etc); regular users don't see the toggle at
  // all, so 'tracked' is the only view that ever applies to them.
  const [view, setView] = useState(user.is_staff ? 'live' : 'tracked');
  const [liveNamespaces, setLiveNamespaces] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);

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

  const loadLive = (id) => {
    if (!id) return;
    setLiveLoading(true);
    api
      .listLiveNamespaces(id)
      .then(setLiveNamespaces)
      .catch((err) => message.error(err.message))
      .finally(() => setLiveLoading(false));
  };

  useEffect(() => load(clusterId), [clusterId]);
  useEffect(() => {
    if (view === 'live') loadLive(clusterId);
  }, [clusterId, view]);

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

  const trackedColumns = [
    { title: 'Name', dataIndex: 'name' },
    ...(user.is_staff ? [{ title: 'Owner', dataIndex: 'owner_username', render: (v) => v ?? '—' }] : []),
    ...(user.is_staff
      ? [
          {
            title: 'Access',
            dataIndex: 'is_accessible',
            render: (value, record) =>
              value ? (
                <Tag icon={<GlobalOutlined />} color="green">accessible</Tag>
              ) : (
                <Tag icon={<LockOutlined />} color="orange">
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
            <Button size="small" icon={<SafetyOutlined />} onClick={() => setAccessRecord(record)}>
              Access
            </Button>
          )}
          <Popconfirm title="Delete this namespace?" onConfirm={() => handleDelete(record.id)}>
            <Button danger size="small" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Read-only: these rows may not even have a DB row (kube-system, etc),
  // so there's no id to delete/manage access by.
  const liveColumns = [
    { title: 'Name', dataIndex: 'name' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value) => (
        <Tag icon={value === 'Active' ? <CheckCircleOutlined /> : undefined} color={value === 'Active' ? 'green' : 'default'}>
          {value}
        </Tag>
      ),
    },
    { title: 'UID', dataIndex: 'uid' },
    { title: 'Created', dataIndex: 'created_at' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <Typography.Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <PartitionOutlined /> Namespaces
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} disabled={!clusterId}>
          Add namespace
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <Select
          style={{ width: 280 }}
          placeholder="Select a cluster"
          value={clusterId}
          onChange={setClusterId}
          options={clusters.map((c) => ({ value: c.id, label: c.name }))}
        />
        {user.is_staff && (
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { label: 'Tracked by this app', value: 'tracked' },
              { label: 'All in cluster (live)', value: 'live' },
            ]}
          />
        )}
      </div>

      {view === 'tracked' ? (
        <Table rowKey="id" columns={trackedColumns} dataSource={namespaces} loading={loading} />
      ) : (
        <Table rowKey="uid" columns={liveColumns} dataSource={liveNamespaces} loading={liveLoading} />
      )}

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
