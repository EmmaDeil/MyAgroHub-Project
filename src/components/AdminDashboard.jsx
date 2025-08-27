import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Modal, Form, Alert, Table } from 'react-bootstrap';
import { adminAPI } from '../services/api';
import AdminNavbar from './AdminNavbar';

const AdminDashboard = ({ user, onLogout, onNavigate }) => {
  const [orders, setOrders] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [smsConfig, setSmsConfig] = useState({
    apiKey: '',
    username: '',
    sandbox: true
  });
  const [showSmsConfig, setShowSmsConfig] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    totalFarmers: 0,
    totalProducts: 24,
    totalUsers: 0,
    pendingVerifications: 2
  });

  // Sample farmers data with phone numbers
  const farmersData = [
    { id: 1, name: 'Adebayo Farms', phone: '+234814567890', location: 'Lagos State', products: ['Fresh Tomatoes'] },
    { id: 2, name: 'Plateau Rice Mills', phone: '+234815678901', location: 'Plateau State', products: ['White Rice'] },
    { id: 3, name: 'Kano Agric Co-op', phone: '+234816789012', location: 'Kano State', products: ['Yellow Maize'] },
    { id: 4, name: 'Jos Highland Farms', phone: '+234817890123', location: 'Plateau State', products: ['Sweet Potatoes'] },
    { id: 5, name: 'Ogun Spice Gardens', phone: '+234818901234', location: 'Ogun State', products: ['Fresh Pepper'] },
    { id: 6, name: 'Cross River Plantain Estate', phone: '+234819012345', location: 'Cross River State', products: ['Plantains'] },
    { id: 7, name: 'Enugu Vegetable Cooperative', phone: '+234810123456', location: 'Enugu State', products: ['Garden Eggs'] },
    { id: 8, name: 'Kaduna Groundnut Association', phone: '+234811234567', location: 'Kaduna State', products: ['Groundnuts'] },
  ];

  useEffect(() => {
    loadOrders();
    loadFarmers();
    loadSmsConfig();
    updateDashboardStats();
  }, []);

  const loadFarmers = async () => {
    try {
      const response = await adminAPI.getFarmers();
      setFarmers(response.data || []);
      console.log('✅ Farmers loaded successfully:', response.data?.length || 0, 'farmers');
    } catch (error) {
      console.error('❌ Error loading farmers:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        token: localStorage.getItem('agrohub_token') ? 'Present' : 'Missing'
      });
      
      let errorMessage = 'Error loading farmers data';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showAlert(errorMessage, 'warning');
      
      // If authentication error, might need to redirect to login
      if (error.response?.status === 401) {
        console.warn('🔐 Authentication failed - user may need to log in again');
      }
    }
  };

  const updateDashboardStats = () => {
    setDashboardStats(prev => ({
      ...prev,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'Pending').length,
      processingOrders: orders.filter(o => o.status === 'Processing').length,
      totalFarmers: farmersData.length
    }));
  };

  const loadOrders = async () => {
    try {
      const response = await adminAPI.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback to localStorage
      const allOrders = JSON.parse(localStorage.getItem('agritech_orders') || '[]');
      setOrders(allOrders);
    }
    updateDashboardStats();
  };

  const loadSmsConfig = () => {
    const config = JSON.parse(localStorage.getItem('agritech_sms_config') || '{}');
    if (config.apiKey) {
      setSmsConfig(config);
    }
  };

  const saveSmsConfig = () => {
    localStorage.setItem('agritech_sms_config', JSON.stringify(smsConfig));
    setShowSmsConfig(false);
    showAlert('SMS configuration saved successfully!', 'success');
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 5000);
  };

  const sendSmsToFarmer = async (farmer, orderDetails) => {
    if (!smsConfig.apiKey || !smsConfig.username) {
      showAlert('Please configure SMS settings first!', 'warning');
      setShowSmsConfig(true);
      return;
    }

    const message = `🌾 AgroHub Order Alert!
New order received:
Product: ${orderDetails.productName}
Quantity: ${orderDetails.quantity} ${orderDetails.unit}
Customer: ${orderDetails.customerName}
Phone: ${orderDetails.customerPhone}
Delivery: ${orderDetails.address}
Order ID: #${orderDetails.orderId}
Please prepare for delivery. Thank you!`;

    const smsData = {
      username: smsConfig.username,
      to: farmer.phone,
      message: message,
      from: 'AgroHub'
    };

    const apiUrl = smsConfig.sandbox 
      ? 'https://api.sandbox.africastalking.com/version1/messaging'
      : 'https://content.africastalking.com/version1/messaging';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': smsConfig.apiKey,
          'Accept': 'application/json'
        },
        body: new URLSearchParams(smsData)
      });

      const result = await response.json();
      
      if (response.ok && result.SMSMessageData.Recipients[0].status === 'Success') {
        showAlert(`SMS sent successfully to ${farmer.name}!`, 'success');
        return true;
      } else {
        throw new Error(result.SMSMessageData.Message || 'SMS sending failed');
      }
    } catch (error) {
      console.error('SMS Error:', error);
      showAlert(`Failed to send SMS: ${error.message}`, 'danger');
      return false;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status: newStatus });
      await loadOrders();
      showAlert(`Order status updated to ${newStatus}`, 'success');
      setShowOrderModal(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      // Fallback to localStorage update
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return order;
      });

      setOrders(updatedOrders);
      localStorage.setItem('agritech_orders', JSON.stringify(updatedOrders));
      showAlert(`Order status updated to ${newStatus} (offline mode)`, 'warning');
      setShowOrderModal(false);
    }
  };

  const handleFarmerVerification = async (farmerId, isVerified) => {
    try {
      await adminAPI.verifyFarmer(farmerId, isVerified);
      await loadFarmers(); // Refresh farmers list
      showAlert(`Farmer ${isVerified ? 'verified' : 'unverified'} successfully`, 'success');
    } catch (error) {
      console.error('Error updating farmer verification:', error);
      showAlert('Error updating farmer verification status', 'danger');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'warning',
      'Processing': 'info',
      'Shipped': 'primary',
      'Delivered': 'success',
      'Cancelled': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': '⏳',
      'Processing': '🔄',
      'Shipped': '🚚',
      'Delivered': '✅',
      'Cancelled': '❌'
    };
    return icons[status] || '📦';
  };

  return (
    <div>
      {/* Admin Navigation Bar */}
      <AdminNavbar 
        user={user} 
        onLogout={onLogout}
        onNavigate={onNavigate}
        stats={dashboardStats}
      />
      
      {/* Main Dashboard Content */}
      <div className="container-fluid px-0 min-vh-100">
        <div className="row g-0 min-vh-100">
          <div className="col-12 px-4 py-5 bg-light">
          {/* Header */}
          <div className="mb-5">
            <h1 className="display-4 text-success mb-2">🛠️ Admin Dashboard</h1>
            <p className="lead text-muted">Comprehensive admin control center for AgroHub platform</p>
          </div>

          {alert.show && (
            <Alert variant={alert.variant} className="mb-4">
              {alert.message}
            </Alert>
          )}

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2rem' }}>📦</div>
                  <h4 className="text-success">{orders.length}</h4>
                  <small className="text-muted">Total Orders</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2rem' }}>⏳</div>
                  <h4 className="text-warning">{orders.filter(o => o.status === 'Pending').length}</h4>
                  <small className="text-muted">Pending Orders</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2rem' }}>🔄</div>
                  <h4 className="text-info">{orders.filter(o => o.status === 'Processing').length}</h4>
                  <small className="text-muted">Processing</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2rem' }}>👨‍🌾</div>
                  <h4 className="text-primary">{farmers.length}</h4>
                  <small className="text-muted">Active Farmers</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Admin Quick Actions */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm bg-success text-white h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2rem' }}>�</div>
                  <h6 className="mt-2">Order Management</h6>
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    onClick={() => onNavigate && onNavigate('admin-orders')}
                  >
                    Manage Orders
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm bg-info text-white h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2rem' }}>�</div>
                  <h6 className="mt-2">Analytics & Reports</h6>
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    onClick={() => onNavigate && onNavigate('admin-reports')}
                  >
                    View Reports
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm bg-warning text-white h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2rem' }}>👥</div>
                  <h6 className="mt-2">User Management</h6>
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    onClick={() => onNavigate && onNavigate('admin-users')}
                  >
                    Manage Users
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm bg-danger text-white h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2rem' }}>⚙️</div>
                  <h6 className="mt-2">System Settings</h6>
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    onClick={() => setShowSmsConfig(true)}
                  >
                    Configure SMS
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Orders Table */}
          <Row>
            <Col lg={8}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">📋 Order Management</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {orders.length > 0 ? (
                    <Table responsive striped hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Product</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td className="fw-bold">#{order.id}</td>
                            <td>
                              <div>{order.customerName}</div>
                              <small className="text-muted">{order.customerPhone}</small>
                            </td>
                            <td>
                              <div>{order.productName}</div>
                              <small className="text-muted">{order.quantity} {order.unit}</small>
                            </td>
                            <td className="fw-bold">₦{order.total?.toLocaleString()}</td>
                            <td>
                              <span className="me-1">{getStatusIcon(order.status)}</span>
                              {getStatusBadge(order.status)}
                            </td>
                            <td>
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowOrderModal(true);
                                }}
                              >
                                Manage
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5">
                      <div style={{ fontSize: '4rem' }}>📦</div>
                      <h4 className="text-muted">No orders yet</h4>
                      <p className="text-muted">Orders will appear here when customers place them</p>
                    </div>
                  )}
                  {orders.length > 5 && (
                    <div className="p-3 bg-light text-center">
                      <Button variant="outline-success" size="sm">View All Orders ({orders.length})</Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            {/* Admin Reports Panel */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-info text-white">
                  <h6 className="mb-0">📈 Quick Reports</h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <h6 className="text-success">Today's Revenue</h6>
                    <h4>₦{(orders.reduce((sum, order) => sum + (order.total || 0), 0)).toLocaleString()}</h4>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-info">This Month</h6>
                    <div className="d-flex justify-content-between">
                      <small>Orders:</small>
                      <strong>{orders.length}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small>Revenue:</small>
                      <strong>₦{(orders.reduce((sum, order) => sum + (order.total || 0), 0)).toLocaleString()}</strong>
                    </div>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-warning">Top Products</h6>
                    <div className="small">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Fresh Tomatoes</span>
                        <Badge bg="success">12 sold</Badge>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>White Rice</span>
                        <Badge bg="success">8 sold</Badge>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Yellow Maize</span>
                        <Badge bg="success">6 sold</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline-info" size="sm" className="w-100">
                    <i className="fas fa-chart-bar me-1"></i>Full Analytics
                  </Button>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-warning text-white">
                  <h6 className="mb-0">🚨 System Alerts</h6>
                </Card.Header>
                <Card.Body>
                  <div className="alert alert-warning py-2 mb-2">
                    <small><strong>Low Stock:</strong> Fresh Tomatoes (5 kg left)</small>
                  </div>
                  <div className="alert alert-info py-2 mb-2">
                    <small><strong>New Farmer:</strong> Pending verification (2)</small>
                  </div>
                  <div className="alert alert-success py-2 mb-0">
                    <small><strong>Orders:</strong> {orders.filter(o => o.status === 'Pending').length} pending review</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Farmers List */}
          <Card className="border-0 shadow-sm mt-4">
            <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">👨‍🌾 Registered Farmers</h5>
              <Button variant="light" size="sm" onClick={loadFarmers}>
                <i className="fas fa-sync-alt me-1"></i>
                Refresh
              </Button>
            </Card.Header>
            <Card.Body>
              {farmers.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-users fa-3x mb-3"></i>
                  <p>No farmers registered yet</p>
                  <small className="text-info">
                    If you're seeing authentication errors, make sure you're logged in as admin with eclefzy@gmail.com
                  </small>
                </div>
              ) : (
                <Row>
                  {farmers.map((farmer) => (
                    <Col md={6} lg={4} key={farmer._id} className="mb-3">
                      <Card className={`h-100 border ${!farmer.isVerified ? 'border-warning' : 'border-success'}`}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="text-success">{farmer.farmName}</h6>
                            <Badge bg={farmer.isVerified ? 'success' : 'warning'}>
                              {farmer.isVerified ? '✅ Verified' : '⏳ Pending'}
                            </Badge>
                          </div>
                          <p className="small text-muted mb-2">
                            <i className="fas fa-user me-1"></i>
                            {farmer.user?.name || 'Unknown'}
                          </p>
                          <p className="small text-muted mb-2">
                            <i className="fas fa-envelope me-1"></i>
                            {farmer.user?.email || 'No email'}
                          </p>
                          <p className="small text-muted mb-2">
                            <i className="fas fa-phone me-1"></i>
                            {farmer.user?.phone || 'No phone'}
                          </p>
                          <p className="small text-muted mb-2">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {farmer.location?.city}, {farmer.location?.state}
                          </p>
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            {farmer.specializations?.map((spec, idx) => (
                              <Badge key={idx} bg="light" text="dark" className="small">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                          {!farmer.isVerified && (
                            <div className="d-grid gap-1">
                              <Button 
                                variant="success" 
                                size="sm"
                                onClick={() => handleFarmerVerification(farmer._id, true)}
                              >
                                ✅ Verify Farmer
                              </Button>
                            </div>
                          )}
                          {farmer.isVerified && (
                            <div className="d-grid gap-1">
                              <Button 
                                variant="outline-warning" 
                                size="sm"
                                onClick={() => handleFarmerVerification(farmer._id, false)}
                              >
                                ❌ Unverify
                              </Button>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
      </div>

      {/* Order Management Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Manage Order #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Customer Information</h6>
                  <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                  <p><strong>Address:</strong> {selectedOrder.address}</p>
                </Col>
                <Col md={6}>
                  <h6>Order Details</h6>
                  <p><strong>Product:</strong> {selectedOrder.productName}</p>
                  <p><strong>Quantity:</strong> {selectedOrder.quantity} {selectedOrder.unit}</p>
                  <p><strong>Total:</strong> ₦{selectedOrder.total?.toLocaleString()}</p>
                  <p><strong>Current Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                </Col>
              </Row>
              
              <hr />
              
              <h6>Update Status</h6>
              <div className="d-flex gap-2 flex-wrap">
                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selectedOrder.status === status ? 'success' : 'outline-secondary'}
                    onClick={() => updateOrderStatus(selectedOrder.id, status)}
                    disabled={selectedOrder.status === status}
                  >
                    {getStatusIcon(status)} {status}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* SMS Configuration Modal */}
      <Modal show={showSmsConfig} onHide={() => setShowSmsConfig(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📱 SMS Configuration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Africa's Talking Username</Form.Label>
              <Form.Control
                type="text"
                value={smsConfig.username}
                onChange={(e) => setSmsConfig({...smsConfig, username: e.target.value})}
                placeholder="Your Africa's Talking username"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>API Key</Form.Label>
              <Form.Control
                type="password"
                value={smsConfig.apiKey}
                onChange={(e) => setSmsConfig({...smsConfig, apiKey: e.target.value})}
                placeholder="Your Africa's Talking API key"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                checked={smsConfig.sandbox}
                onChange={(e) => setSmsConfig({...smsConfig, sandbox: e.target.checked})}
                label="Use Sandbox Environment"
              />
              <Form.Text className="text-muted">
                Uncheck this for production use
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSmsConfig(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={saveSmsConfig}>
            Save Configuration
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
