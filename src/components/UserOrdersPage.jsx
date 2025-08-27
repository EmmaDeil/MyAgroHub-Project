import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Modal, Table, Alert } from 'react-bootstrap';
import { ordersAPI } from '../services/api';

const UserOrdersPage = ({ user, onNavigate }) => {
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'info' });

  useEffect(() => {
    loadUserOrders();
  }, [user]);

  const loadUserOrders = async () => {
    if (!user) return;
    
    try {
      const response = await ordersAPI.getOrders();
      setUserOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback to localStorage if API fails
      const allOrders = JSON.parse(localStorage.getItem('agrohub_orders') || '[]');
      const myOrders = allOrders.filter(order => order.userId === user.id);
      setUserOrders(myOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  };

  const showAlert = (message, variant = 'info') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'info' }), 5000);
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

  const getStatusDescription = (status) => {
    const descriptions = {
      'Pending': 'Your order has been received and is waiting to be processed',
      'Processing': 'Your order is being prepared by the farmer',
      'Shipped': 'Your order is on the way to your delivery address',
      'Delivered': 'Your order has been successfully delivered',
      'Cancelled': 'This order has been cancelled'
    };
    return descriptions[status] || 'Order status unknown';
  };

  const cancelOrder = async (orderId) => {
    try {
      await ordersAPI.cancelOrder(orderId);
      loadUserOrders();
      setShowOrderModal(false);
      showAlert('Order cancelled successfully', 'warning');
    } catch (error) {
      console.error('Error cancelling order:', error);
      // Fallback to localStorage update
      const allOrders = JSON.parse(localStorage.getItem('agrohub_orders') || '[]');
      const updatedOrders = allOrders.map(order => {
        if (order.id === orderId && order.status === 'Pending') {
          return { ...order, status: 'Cancelled', updatedAt: new Date().toISOString() };
        }
        return order;
      });
      
      localStorage.setItem('agrohub_orders', JSON.stringify(updatedOrders));
      loadUserOrders();
      setShowOrderModal(false);
      showAlert('Order cancelled successfully', 'warning');
    }
  };

  const reorderItems = (order) => {
    // This would add the items back to cart
    showAlert(`Reorder functionality would add ${order.productName} back to your cart`, 'info');
  };

  const getTotalSpent = () => {
    return userOrders
      .filter(order => order.status !== 'Cancelled')
      .reduce((total, order) => total + (order.total || 0), 0);
  };

  const getOrderStats = () => {
    const stats = {
      total: userOrders.length,
      pending: userOrders.filter(o => o.status === 'Pending').length,
      processing: userOrders.filter(o => o.status === 'Processing').length,
      delivered: userOrders.filter(o => o.status === 'Delivered').length,
      cancelled: userOrders.filter(o => o.status === 'Cancelled').length
    };
    return stats;
  };

  const stats = getOrderStats();

  return (
    <div className="w-100 bg-gradient" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <div className="w-100 min-vh-100">
        {/* Header Section */}
        <div className="bg-success text-white py-5 w-100">
          <div className="container-fluid px-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="display-4 mb-3">📦 My Orders</h1>
                <p className="lead mb-0">Track your orders and view purchase history</p>
              </div>
              <div className="col-md-4 text-md-end">
                <div className="d-flex justify-content-md-end justify-content-center mt-3 mt-md-0">
                  <div className="text-center me-4">
                    <h3 className="mb-1">{stats.total}</h3>
                    <small>Total Orders</small>
                  </div>
                  <div className="text-center">
                    <h3 className="mb-1">₦{getTotalSpent().toLocaleString()}</h3>
                    <small>Total Spent</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container-fluid px-4 py-4 w-100">
          {alert.show && (
            <Alert variant={alert.variant} className="mb-4">
              {alert.message}
            </Alert>
          )}

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2.5rem' }} className="mb-2">⏳</div>
                  <h4 className="text-warning mb-1">{stats.pending}</h4>
                  <small className="text-muted">Pending</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2.5rem' }} className="mb-2">🔄</div>
                  <h4 className="text-info mb-1">{stats.processing}</h4>
                  <small className="text-muted">Processing</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2.5rem' }} className="mb-2">✅</div>
                  <h4 className="text-success mb-1">{stats.delivered}</h4>
                  <small className="text-muted">Delivered</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '2.5rem' }} className="mb-2">❌</div>
                  <h4 className="text-danger mb-1">{stats.cancelled}</h4>
                  <small className="text-muted">Cancelled</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Orders List */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">📋 Order History</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {userOrders.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Order Details</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <div className="fw-bold">#{order.id}</div>
                            <small className="text-muted">
                              by {order.farmerName}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2" style={{ fontSize: '1.5rem' }}>
                                {order.productImage}
                              </span>
                              <div>
                                <div className="fw-medium">{order.productName}</div>
                                <small className="text-muted">{order.farmerLocation}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="fw-bold">{order.quantity || 'N/A'}</div>
                            <small className="text-muted">{order.unit || 'items'}</small>
                          </td>
                          <td className="fw-bold">₦{(order.total || 0).toLocaleString()}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{getStatusIcon(order.status)}</span>
                              {getStatusBadge(order.status)}
                            </div>
                          </td>
                          <td>
                            <div>{
                              order.createdAt ? 
                                new Date(order.createdAt).toLocaleDateString() : 
                                order.orderDate || 'Date N/A'
                            }</div>
                            <small className="text-muted">
                              {order.createdAt ? 
                                new Date(order.createdAt).toLocaleTimeString() : 
                                ''
                              }
                            </small>
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
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div style={{ fontSize: '5rem' }} className="mb-4">📦</div>
                  <h4 className="text-muted mb-3">No orders yet</h4>
                  <p className="text-muted mb-4">
                    Start shopping to see your orders here!
                  </p>
                  <Button 
                    variant="success" 
                    size="lg"
                    onClick={() => onNavigate && onNavigate('home')}
                  >
                    <i className="fas fa-leaf me-2"></i>
                    Start Shopping
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Footer Section */}
        <div className="bg-success text-white py-3 mt-auto w-100">
          <div className="container-fluid px-4">
            <div className="row align-items-center">
              <div className="col-md-6">
                <small>© 2025 AgroHub Farm Store - Your Order History</small>
              </div>
              <div className="col-md-6 text-md-end">
                <small>Need help? Contact support: +234 800 AGRI TECH</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Order Details - #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <Row>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-success mb-3">
                        <i className="fas fa-box me-2"></i>Order Information
                      </h6>
                      <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
                      <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                      <p><strong>Order Date:</strong> {
                        selectedOrder.createdAt ? 
                          new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 
                          selectedOrder.orderDate || 'Date not available'
                      }</p>
                      {selectedOrder.updatedAt && selectedOrder.updatedAt !== selectedOrder.createdAt && (
                        <p><strong>Last Updated:</strong> {new Date(selectedOrder.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-success mb-3">
                        <i className="fas fa-leaf me-2"></i>Product Details
                      </h6>
                      <div className="d-flex align-items-center mb-3">
                        <span style={{ fontSize: '3rem' }} className="me-3">
                          {selectedOrder.productImage || '🛒'}
                        </span>
                        <div>
                          <h6 className="mb-1">{selectedOrder.productName || 'Multiple Items'}</h6>
                          <small className="text-muted">by {selectedOrder.farmerName || 'Various Farmers'}</small>
                        </div>
                      </div>
                      <p><strong>Quantity:</strong> {selectedOrder.quantity || 'N/A'} {selectedOrder.unit || 'items'}</p>
                      <p><strong>Unit Price:</strong> ₦{(selectedOrder.unitPrice || 0).toLocaleString()}</p>
                      <p><strong>Total:</strong> ₦{(selectedOrder.total || 0).toLocaleString()}</p>
                      
                      {selectedOrder.productDetails && selectedOrder.productDetails.length > 1 && (
                        <div className="mt-3">
                          <h6 className="text-muted mb-2">Items in this order:</h6>
                          {selectedOrder.productDetails.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                              <div className="d-flex align-items-center">
                                <span className="me-2">{item.image || '🛒'}</span>
                                <small>{item.name}</small>
                              </div>
                              <small>{item.quantity} × ₦{item.price.toLocaleString()} = ₦{item.total.toLocaleString()}</small>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-success mb-3">
                        <i className="fas fa-truck me-2"></i>Delivery Information
                      </h6>
                      <p><strong>Delivery Address:</strong><br/>{selectedOrder.address || selectedOrder.deliveryAddress || 'Address not provided'}</p>
                      <p><strong>Phone:</strong> {selectedOrder.customerPhone || 'Phone not provided'}</p>
                      <p><strong>Email:</strong> {selectedOrder.customerEmail || 'Email not provided'}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-success mb-3">
                        <i className="fas fa-info-circle me-2"></i>Status Information
                      </h6>
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-2">{getStatusIcon(selectedOrder.status)}</span>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                      <p className="small text-muted">
                        {getStatusDescription(selectedOrder.status)}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder?.status === 'Pending' && (
            <Button 
              variant="danger" 
              onClick={() => cancelOrder(selectedOrder.id)}
            >
              <i className="fas fa-times me-1"></i>Cancel Order
            </Button>
          )}
          {selectedOrder?.status === 'Delivered' && (
            <Button 
              variant="success" 
              onClick={() => reorderItems(selectedOrder)}
            >
              <i className="fas fa-redo me-1"></i>Reorder
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserOrdersPage;
