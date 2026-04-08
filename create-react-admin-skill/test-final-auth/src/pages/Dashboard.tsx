import { Card, Col, Row, Statistic } from 'antd';

function Dashboard() {
  return (
    <div>
      <h2>仪表盘</h2>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="今日活跃用户" value={1234} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="新增订单" value={87} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待处理工单" value={19} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="异常告警" value={3} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
