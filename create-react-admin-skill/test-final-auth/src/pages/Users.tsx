import { Space, Table, Tag, Typography } from 'antd';

type UserRecord = {
  key: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
};

const data: UserRecord[] = [
  { key: '1', name: '张三', role: '管理员', status: 'active' },
  { key: '2', name: '李四', role: '运营', status: 'active' },
  { key: '3', name: '王五', role: '访客', status: 'inactive' }
];

function Users() {
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        用户管理
      </Typography.Title>
      <Table
        rowKey="key"
        dataSource={data}
        columns={[
          { title: '姓名', dataIndex: 'name' },
          { title: '角色', dataIndex: 'role' },
          {
            title: '状态',
            dataIndex: 'status',
            render: (status: UserRecord['status']) =>
              status === 'active' ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>
          }
        ]}
      />
    </Space>
  );
}

export default Users;
