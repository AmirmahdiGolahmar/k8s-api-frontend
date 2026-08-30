import { Modal, Form, Switch, Select } from 'antd';

// Shared by Clusters and Namespaces -- both need the identical shape
// (accessible toggle + exception-list multi-select), only where the save
// actually goes differs per page.
export default function AccessModal({ open, title, record, users, onCancel, onSave }) {
  const [form] = Form.useForm();

  return (
    <Modal title={title} open={open} onCancel={onCancel} onOk={() => form.submit()} destroyOnHidden>
      <Form
        layout="vertical"
        form={form}
        onFinish={onSave}
        initialValues={{
          is_accessible: record?.is_accessible ?? true,
          allowed_users: record?.allowed_users ?? [],
        }}
      >
        <Form.Item
          name="is_accessible"
          label="Accessible to regular users"
          valuePropName="checked"
          extra="Staff can always see and manage this regardless of this setting."
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="allowed_users"
          label="Exceptions"
          extra="These users can access it even when the toggle above is off."
        >
          <Select
            mode="multiple"
            placeholder="No exceptions"
            options={users.map((u) => ({ value: u.id, label: u.username }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
