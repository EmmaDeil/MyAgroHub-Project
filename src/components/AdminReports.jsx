import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Alert, Table, Badge } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminReports = ({ user, onLogout, onNavigate }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  // Sample data for reports
  const reportData = {
    salesOverTime: {
      labels: ['Jan 20', 'Jan 21', 'Jan 22', 'Jan 23', 'Jan 24', 'Jan 25', 'Jan 26'],
      datasets: [
        {
          label: 'Daily Sales (₦)',
          data: [45000, 52000, 38000, 65000, 72000, 58000, 85000],
          borderColor: 'rgb(40, 167, 69)',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4,
        },
      ],
    },
    ordersByStatus: {
      labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      datasets: [
        {
          data: [12, 8, 5, 25, 3],
          backgroundColor: [
            '#ffc107',
            '#17a2b8', 
            '#007bff',
            '#28a745',
            '#dc3545'
          ],
        },
      ],
    },
    topProducts: {
      labels: ['Fresh Tomatoes', 'White Rice', 'Yellow Maize', 'Sweet Potatoes', 'Fresh Pepper'],
      datasets: [
        {
          label: 'Sales (₦)',
          data: [125000, 98000, 87000, 65000, 45000],
          backgroundColor: 'rgba(40, 167, 69, 0.8)',
        },
      ],
    },
    farmerPerformance: [
      { name: 'Adebayo Farms', orders: 15, revenue: 125000, rating: 4.8 },
      { name: 'Plateau Rice Mills', orders: 12, revenue: 98000, rating: 4.6 },
      { name: 'Kano Agric Co-op', orders: 10, revenue: 87000, rating: 4.7 },
      { name: 'Jos Highland Farms', orders: 8, revenue: 65000, rating: 4.5 },
      { name: 'Ogun Spice Gardens', orders: 6, revenue: 45000, rating: 4.4 },
    ]
  };

  const summaryStats = {
    totalRevenue: 420000,
    totalOrders: 53,
    activeCustomers: 128,
    activeFarmers: 15,
    averageOrderValue: 7925,
    conversionRate: 12.5,
    customerSatisfaction: 4.6,
    deliverySuccessRate: 94.3
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 5000);
  };

  const exportReport = (type) => {
    showAlert(`${type} report exported successfully!`, 'success');
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div>
      {/* Admin Navigation Bar */}
      <AdminNavbar 
        user={user} 
        onLogout={onLogout}
        onNavigate={onNavigate}
      />
      
      {/* Main Reports Content */}
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="text-success mb-1">📈 Reports & Analytics</h2>
            <p className="text-muted mb-0">Business insights and performance metrics</p>
          </div>
          <div>
            <Button variant="outline-secondary" onClick={() => onNavigate('admin')} className="me-2">
              ← Back to Dashboard
            </Button>
            <Button variant="success" onClick={() => exportReport('Complete')}>
              <i className="fas fa-download me-1"></i>Export Report
            </Button>
          </div>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} className="mb-4">
          {alert.message}
        </Alert>
      )}

      {/* Period Selection */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3}>
              <Form.Label>Report Period:</Form.Label>
              <Form.Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </Form.Select>
            </Col>
            <Col md={9} className="text-end">
              <Button variant="outline-primary" size="sm" className="me-2" onClick={() => exportReport('Sales')}>
                📊 Export Sales Data
              </Button>
              <Button variant="outline-info" size="sm" className="me-2" onClick={() => exportReport('Customer')}>
                👥 Export Customer Data
              </Button>
              <Button variant="outline-success" size="sm" onClick={() => exportReport('Farmer')}>
                👨‍🌾 Export Farmer Data
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Key Metrics Summary */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100 bg-success text-white">
            <Card.Body className="text-center">
              <div style={{ fontSize: '2.5rem' }}>💰</div>
              <h3>₦{summaryStats.totalRevenue.toLocaleString()}</h3>
              <p className="mb-0">Total Revenue</p>
              <small className="opacity-75">+15% from last period</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100 bg-primary text-white">
            <Card.Body className="text-center">
              <div style={{ fontSize: '2.5rem' }}>📦</div>
              <h3>{summaryStats.totalOrders}</h3>
              <p className="mb-0">Total Orders</p>
              <small className="opacity-75">+8% from last period</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100 bg-info text-white">
            <Card.Body className="text-center">
              <div style={{ fontSize: '2.5rem' }}>👥</div>
              <h3>{summaryStats.activeCustomers}</h3>
              <p className="mb-0">Active Customers</p>
              <small className="opacity-75">+22% from last period</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100 bg-warning text-white">
            <Card.Body className="text-center">
              <div style={{ fontSize: '2.5rem' }}>👨‍🌾</div>
              <h3>{summaryStats.activeFarmers}</h3>
              <p className="mb-0">Active Farmers</p>
              <small className="opacity-75">+5% from last period</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div style={{ fontSize: '2rem' }}>💵</div>
              <h4 className="text-success">₦{summaryStats.averageOrderValue.toLocaleString()}</h4>
              <small className="text-muted">Average Order Value</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div style={{ fontSize: '2rem' }}>📈</div>
              <h4 className="text-info">{summaryStats.conversionRate}%</h4>
              <small className="text-muted">Conversion Rate</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div style={{ fontSize: '2rem' }}>⭐</div>
              <h4 className="text-warning">{summaryStats.customerSatisfaction}/5</h4>
              <small className="text-muted">Customer Satisfaction</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div style={{ fontSize: '2rem' }}>🚚</div>
              <h4 className="text-success">{summaryStats.deliverySuccessRate}%</h4>
              <small className="text-muted">Delivery Success Rate</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        {/* Sales Over Time Chart */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-success text-white">
              <h6 className="mb-0">📈 Sales Over Time</h6>
            </Card.Header>
            <Card.Body>
              <Line data={reportData.salesOverTime} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>

        {/* Orders by Status */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">📊 Orders by Status</h6>
            </Card.Header>
            <Card.Body>
              <Doughnut data={reportData.ordersByStatus} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Products and Farmer Performance */}
      <Row className="mb-4">
        {/* Top Products Chart */}
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-info text-white">
              <h6 className="mb-0">🏆 Top Selling Products</h6>
            </Card.Header>
            <Card.Body>
              <Bar data={reportData.topProducts} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>

        {/* Farmer Performance Table */}
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-warning text-white">
              <h6 className="mb-0">👨‍🌾 Top Performing Farmers</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Farmer</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.farmerPerformance.map((farmer, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-2"
                            style={{ width: '30px', height: '30px', fontSize: '12px' }}
                          >
                            {index + 1}
                          </div>
                          {farmer.name}
                        </div>
                      </td>
                      <td>
                        <Badge bg="primary">{farmer.orders}</Badge>
                      </td>
                      <td className="fw-bold">₦{farmer.revenue.toLocaleString()}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-1">⭐</span>
                          {farmer.rating}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Log */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-secondary text-white">
          <h6 className="mb-0">📋 Recent Activity Log</h6>
        </Card.Header>
        <Card.Body>
          <div className="timeline">
            {[
              { time: '2 hours ago', action: 'New order #ORD-001 received from Adebayo Johnson', type: 'order' },
              { time: '4 hours ago', action: 'Farmer "Plateau Rice Mills" added 50kg White Rice to inventory', type: 'inventory' },
              { time: '6 hours ago', action: 'Order #ORD-002 status updated to "Shipped"', type: 'status' },
              { time: '8 hours ago', action: 'New customer "Fatima Usman" registered', type: 'customer' },
              { time: '1 day ago', action: 'Payment of ₦40,000 received for order #ORD-003', type: 'payment' }
            ].map((activity, index) => (
              <div key={index} className="d-flex mb-3">
                <div className="me-3">
                  <div 
                    className={`rounded-circle d-flex align-items-center justify-content-center ${
                      activity.type === 'order' ? 'bg-primary' :
                      activity.type === 'inventory' ? 'bg-success' :
                      activity.type === 'status' ? 'bg-info' :
                      activity.type === 'customer' ? 'bg-warning' : 'bg-secondary'
                    } text-white`}
                    style={{ width: '32px', height: '32px', fontSize: '14px' }}
                  >
                    {activity.type === 'order' ? '📦' :
                     activity.type === 'inventory' ? '📊' :
                     activity.type === 'status' ? '🔄' :
                     activity.type === 'customer' ? '👤' : '💰'}
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div>{activity.action}</div>
                  <small className="text-muted">{activity.time}</small>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
      </div>
    </div>
  );
};

export default AdminReports;
