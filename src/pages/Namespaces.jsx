import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Select, Popconfirm, Typography, message } from 'antd';
import { api } from '../api/client';

export default function Namespaces() {
  const [clusters, setClusters] = useState([]);
  const [clusterId, setClusterId] = useState(null);
  const [namespaces, setNamespaces] = useState([]);
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

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm title="Delete this namespace?" onConfirm={() => handleDelete(record.id)}>
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
    </div>
  );
}
