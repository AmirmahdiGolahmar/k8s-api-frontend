import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Select, Radio, Typography, message, Tag, Descriptions } from 'antd';
import { api } from '../api/client';

const STATUS_COLORS = {
  pending: 'default',
  running: 'blue',
  completed: 'green',
  failed: 'red',
  active: 'green',
  disabled: 'default',
};

export default function Backups() {
  const [clusters, setClusters] = useState([]);
  const [clusterId, setClusterId] = useState(null);
  const [apps, setApps] = useState([]);
  const [appId, setAppId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
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
    if (!clusterId) return;
    api
      .listApps(clusterId)
      .then((data) => {
        setApps(data);
        setAppId(data.length > 0 ? data[0].id : null);
      })
      .catch((err) => message.error(err.message));
  }, [clusterId]);

  const load = (id) => {
    if (!id) {
      setItems([]);
      return;
    }
    setLoading(true);
    api
      .listBackups(id)
      .then(setItems)
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(appId), [appId]);

  const handleCreate = async (values) => {
    try {
      const body = { app_id: appId, source_path: values.source_path };
      if (values.mode === 'scheduled') body.schedule = values.schedule;
      await api.createBackup(body);
      message.success(values.mode === 'scheduled' ? 'Schedule created.' : 'Backup started.');
      setModalOpen(false);
      form.resetFields();
      load(appId);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleView = async (id) => {
    try {
      const data = await api.getBackup(id);
      setDetail(data);
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'Type', dataIndex: 'type', render: (value) => <Tag>{value}</Tag> },
    { title: 'ID', render: (_, record) => record.backup_id ?? record.schedule_id },
    { title: 'Status', dataIndex: 'status', render: (value) => <Tag color={STATUS_COLORS[value] ?? 'default'}>{value}</Tag> },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Button size="small" onClick={() => handleView(record.backup_id ?? record.schedule_id)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Backups
        </Typography.Title>
        <Button type="primary" onClick={() => setModalOpen(true)} disabled={!appId}>
          New backup
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Select
          style={{ width: 240 }}
          placeholder="Select a cluster"
          value={clusterId}
          onChange={setClusterId}
          options={clusters.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select
          style={{ width: 240 }}
          placeholder="Select an app"
          value={appId}
          onChange={setAppId}
          options={apps.map((a) => ({ value: a.id, label: `${a.namespace}/${a.name}` }))}
        />
      </div>

      <Table rowKey={(r) => r.backup_id ?? r.schedule_id} columns={columns} dataSource={items} loading={loading} />

      <Modal
        title="New backup"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form layout="vertical" form={form} onFinish={handleCreate} initialValues={{ mode: 'immediate' }}>
          <Form.Item name="mode" label="Type">
            <Radio.Group
              options={[
                { label: 'Run once now', value: 'immediate' },
                { label: 'Recurring (cron)', value: 'scheduled' },
              ]}
            />
          </Form.Item>
          <Form.Item name="source_path" label="Source path" rules={[{ required: true }]}>
            <Input placeholder="/var/lib/data" />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.mode !== cur.mode}
          >
            {({ getFieldValue }) =>
              getFieldValue('mode') === 'scheduled' && (
                <Form.Item
                  name="schedule"
                  label="Cron schedule"
                  extra="5-field cron: minute hour day-of-month month day-of-week"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="0 3 * * *" />
                </Form.Item>
              )
            }
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Backup detail" open={!!detail} onCancel={() => setDetail(null)} footer={null}>
        {detail && (
          <Descriptions column={1} bordered size="small">
            {Object.entries(detail).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {String(value ?? '')}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
