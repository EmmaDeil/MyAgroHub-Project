import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Table, ProgressBar } from 'react-bootstrap';
import NavigationHeader from './NavigationHeader';

const UserDashboard = ({ user, onLogout, cartItems, getTotalItems, getTotalPrice, setCurrentPage, onShowAuth }) => {
  const [userOrders, setUserOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // Sample user orders data
  const sampleOrders = [
    {
      id: 'ORD001',
      productName: 'Fresh Tomatoes',
      quantity: 5,
      unit: 'kg',
      total: 4000,
      status: 'Delivered',
      orderDate: '2025-07-20',
      estimatedDelivery: '2025-07-22',
      farmerName: 'Adebayo Farms'
    },
    {
      id: 'ORD002',
      productName: 'White Rice',
      quantity: 2,
      unit: 'kg',
      total: 2400,
      status: 'Shipped',
      orderDate: '2025-07-23',
      estimatedDelivery: '2025-07-25',
      farmerName: 'Plateau Rice Mills'
    },
    {
      id: 'ORD003',
      productName: 'Fresh Pepper',
      quantity: 1,
      unit: 'kg',
      total: 2000,
      status: 'Processing',
      orderDate: '2025-07-24',
      estimatedDelivery: '2025-07-26',
      farmerName: 'Ogun Spice Gardens'
    }
  ];

  useEffect(() => {
    // Load user orders from localStorage or API
    const orders = JSON.parse(localStorage.getItem('agrohub_orders') || '[]');
    const filteredOrders = orders.filter(order => order.customerEmail === user?.email);
    
    if (filteredOrders.length === 0) {
      // Use sample data if no real orders
      setUserOrders(sampleOrders);
      setRecentOrders(sampleOrders.slice(0, 3));
    } else {
      setUserOrders(filteredOrders);
      setRecentOrders(filteredOrders.slice(0, 3));
    }
  }, [user]);

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

  const getDeliveryProgress = (status) => {
    const progress = {
      'Pending': 25,
      'Processing': 50,
      'Shipped': 75,
      'Delivered': 100,
      'Cancelled': 0
    };
    return progress[status] || 0;
  };

  return (
    <div>
      {/* User Navigation Header */}
      <NavigationHeader 
        currentPage="dashboard"
        setCurrentPage={setCurrentPage}
        getTotalItems={getTotalItems}
        getTotalPrice={getTotalPrice}
        user={user}
        onShowAuth={onShowAuth}
        onLogout={onLogout}
      />
      
      {/* User Dashboard Content */}
      <div className="container-fluid px-0 min-vh-100 bg-light">
        <div className="container py-5">
          {/* Welcome Header */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="text-center">
                <h1 className="display-5 text-success mb-2">
                  🌾 Welcome back, {user?.name || user?.firstName}!
                </h1>
                <p className="lead text-muted">Track your orders and discover fresh farm products</p>
              </div>
            </div>
          </div>

          {/* User Stats Cards */}
          <Row className="mb-5">
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2.5rem' }} className="text-success mb-2">📦</div>
                  <h4 className="text-success">{userOrders.length}</h4>
                  <small className="text-muted">Total Orders</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2.5rem' }} className="text-warning mb-2">🛒</div>
                  <h4 className="text-warning">{getTotalItems()}</h4>
                  <small className="text-muted">Items in Cart</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2.5rem' }} className="text-info mb-2">💰</div>
                  <h4 className="text-info">₦{getTotalPrice().toLocaleString()}</h4>
                  <small className="text-muted">Cart Value</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2.5rem' }} className="text-primary mb-2">🎯</div>
                  <h4 className="text-primary">{userOrders.filter(o => o.status === 'Delivered').length}</h4>
                  <small className="text-muted">Completed Orders</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row className="mb-5">
            <Col md={3}>
              <Card className="border-0 shadow-sm bg-success text-white h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '3rem' }} className="mb-3">🛍️</div>
                  <h5>Browse Products</h5>
                  <p className="mb-3">Discover fresh farm produce from verified farmers</p>
                  <Button 
                    variant="outline-light"
                    onClick={() => setCurrentPage('home')}
                  >
                    Shop Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm bg-info text-white h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '3rem' }} className="mb-3">📋</div>
                  <h5>View All Orders</h5>
                  <p className="mb-3">Track your order history and delivery status</p>
                  <Button 
                    variant="outline-light"
                    onClick={() => setCurrentPage('orders')}
                  >
                    My Orders
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm bg-warning text-white h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '3rem' }} className="mb-3">🛒</div>
                  <h5>Complete Purchase</h5>
                  <p className="mb-3">Review your cart and complete your order</p>
                  <Button 
                    variant="outline-light"
                    onClick={() => setCurrentPage('cart')}
                  >
                    View Cart ({getTotalItems()})
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm bg-primary text-white h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '3rem' }} className="mb-3">🌱</div>
                  <h5>Become a Farmer</h5>
                  <p className="mb-3">Join our marketplace and sell your farm products</p>
                  <Button 
                    variant="outline-light"
                    onClick={() => {
                      alert('Coming Soon! Farmer registration will be available in the next update. For now, contact admin@agrohub.com to become a verified farmer.');
                    }}
                  >
                    Join As Farmer
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Orders */}
          <Row>
            <Col lg={8}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">📦 Recent Orders</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {recentOrders.length > 0 ? (
                    <Table responsive className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Order ID</th>
                          <th>Product</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="fw-bold">#{order.id}</td>
                            <td>
                              <div>{order.productName}</div>
                              <small className="text-muted">{order.quantity} {order.unit} from {order.farmerName}</small>
                            </td>
                            <td className="fw-bold">₦{order.total.toLocaleString()}</td>
                            <td>
                              <span className="me-1">{getStatusIcon(order.status)}</span>
                              {getStatusBadge(order.status)}
                            </td>
                            <td>
                              <div style={{ width: '100px' }}>
                                <ProgressBar 
                                  now={getDeliveryProgress(order.status)} 
                                  size="sm"
                                  variant={order.status === 'Delivered' ? 'success' : 'info'}
                                />
                                <small className="text-muted">{getDeliveryProgress(order.status)}%</small>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5">
                      <div style={{ fontSize: '4rem' }} className="mb-3">🛍️</div>
                      <h4 className="text-muted">No orders yet</h4>
                      <p className="text-muted">Start shopping to see your orders here!</p>
                      <Button 
                        variant="success"
                        onClick={() => setCurrentPage('home')}
                      >
                        Start Shopping
                      </Button>
                    </div>
                  )}
                  {userOrders.length > 3 && (
                    <div className="p-3 bg-light text-center">
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => setCurrentPage('orders')}
                      >
                        View All Orders ({userOrders.length})
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            {/* User Profile & Quick Info */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-primary text-white">
                  <h6 className="mb-0">👤 Your Profile</h6>
                </Card.Header>
                <Card.Body>
                  <div className="text-center mb-3">
                    {/* Profile Picture */}
                    <div className="position-relative d-inline-block mb-3">
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt="Profile" 
                          className="rounded-circle border border-3 border-primary"
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover' 
                          }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle bg-primary bg-opacity-10 border border-3 border-primary d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '80px', 
                            height: '80px' 
                          }}
                        >
                          <i className="fas fa-user text-primary" style={{ fontSize: '2rem' }}></i>
                        </div>
                      )}
                    </div>
                    <h5>{user?.name || user?.firstName} {user?.lastName}</h5>
                    <p className="text-muted mb-1">{user?.email}</p>
                    {user?.phone && <p className="text-muted">{user?.phone}</p>}
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Member since:</small>
                    <div>{new Date().toLocaleDateString()}</div>
                  </div>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="w-100"
                    onClick={() => setCurrentPage('settings')}
                  >
                    <i className="fas fa-edit me-1"></i>Edit Profile
                  </Button>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-info text-white">
                  <h6 className="mb-0">💡 Tips for You</h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <h6 className="text-success">🌱 Fresh Tip</h6>
                    <small>Order vegetables early in the week for the freshest produce!</small>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-info">💰 Save Money</h6>
                    <small>Follow your favorite farmers for exclusive deals and seasonal offers.</small>
                  </div>
                  <div>
                    <h6 className="text-warning">📞 Support</h6>
                    <small>Need help? Contact us at +234 800 AGRI TECH</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
