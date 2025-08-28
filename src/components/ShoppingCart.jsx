import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, Alert, Container, Spinner, ProgressBar } from 'react-bootstrap';
import { ordersAPI } from '../services/api';

function ShoppingCart({ cartItems = [], updateQuantity, removeFromCart, setCartItems, user, showNotification }) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderProgress, setOrderProgress] = useState(0);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria'
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [checkoutAlert, setCheckoutAlert] = useState('');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');

  // Initialize customer information from user profile when modal opens
  useEffect(() => {
    if (user && showCheckoutModal) {
      setCustomerInfo({
        name: user.name || user.firstName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        country: user.address?.country || 'Nigeria'
      });
    }
  }, [user, showCheckoutModal]);

  const handleUpdateQuantity = (productId, newQuantity) => {
    const item = cartItems.find(item => item.id === productId);
    
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    // Check stock availability if stock info is available
    if (item?.stock && newQuantity > item.stock) {
      if (showNotification) {
        showNotification(`Maximum quantity reached for this item`, 'warning');
      }
      return;
    }
    
    if (updateQuantity) {
      updateQuantity(productId, newQuantity);
      if (showNotification) {
        showNotification(`Updated ${item?.name || 'item'} quantity`, 'success');
      }
    }
  };

  const handleRemoveFromCart = (productId) => {
    const itemToRemove = cartItems.find(item => item.id === productId);
    setItemToRemove(itemToRemove);
    setShowRemoveModal(true);
  };

  const confirmRemoveItem = () => {
    if (removeFromCart && itemToRemove) {
      removeFromCart(itemToRemove.id);
      if (showNotification) {
        showNotification(`${itemToRemove.name} removed from cart`, 'info');
      }
    }
    setShowRemoveModal(false);
    setItemToRemove(null);
  };

  const getTotalPrice = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => {
      const quantity = item.quantity || 1;
      const price = item.price * quantity; // Always calculate from current price and quantity
      return total + price;
    }, 0);
  };

  const getTotalItems = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!user) {
      if (showNotification) {
        showNotification('Please login to complete your order', 'warning');
      }
      return;
    }

    setIsProcessingOrder(true);
    setOrderProgress(20);

    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          unit: item.unit,
          farmer: item.farmer,
          image: item.image
        })),
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        deliveryAddress: {
          address: customerInfo.address,
          city: customerInfo.city,
          state: customerInfo.state,
          country: customerInfo.country
        },
        paymentMethod,
        specialInstructions,
        total: getTotalPrice() + 500 // Including delivery fee
      };

      setOrderProgress(50);

      // Create order via API
      let response;
      try {
        response = await ordersAPI.createOrder(orderData);
        setOrderProgress(80);
      } catch (apiError) {
        console.warn('API unavailable, creating order locally:', apiError);
        
        // Fallback to local storage
        const existingOrders = JSON.parse(localStorage.getItem('agrohub_orders') || '[]');
        const currentDate = new Date();
        const newOrder = {
          id: `ORD-${Date.now()}`,
          userId: user.id,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          deliveryAddress: {
            address: customerInfo.address,
            city: customerInfo.city,
            state: customerInfo.state,
            country: customerInfo.country
          },
          address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state}`,
          productName: cartItems.map(item => item.name).join(', '),
          productImage: cartItems[0]?.image || '🛒',
          farmerName: cartItems[0]?.farmer || 'Multiple Farmers',
          farmerLocation: cartItems[0]?.location || 'Various Locations',
          quantity: cartItems.reduce((total, item) => total + (item.quantity || 1), 0),
          unit: cartItems[0]?.unit || 'items',
          unitPrice: getTotalItems() > 0 ? Math.round(getTotalPrice() / getTotalItems()) : 0,
          productDetails: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity || 1,
            unit: item.unit,
            price: item.price,
            total: (item.quantity || 1) * item.price,
            image: item.image,
            farmer: item.farmer
          })),
          total: getTotalPrice() + 500,
          orderDate: currentDate.toISOString().split('T')[0],
          createdAt: currentDate.toISOString(),
          updatedAt: currentDate.toISOString(),
          status: 'Pending',
          paymentMethod,
          specialInstructions
        };
        
        existingOrders.push(newOrder);
        localStorage.setItem('agrohub_orders', JSON.stringify(existingOrders));
        
        response = {
          success: true,
          data: { order: newOrder }
        };
      }

      setOrderProgress(90);

      // Send email confirmation
      try {
        await sendOrderConfirmationEmail(response.data.order);
      } catch (emailError) {
        console.warn('Email sending failed, but order was created:', emailError);
      }

      setOrderProgress(100);
      
      // Success handling
      const orderId = response.data.order.id;
      setLastOrderId(orderId);
      setShowCheckoutModal(false);
      setShowOrderSuccess(true);
      
      // Clear cart after successful order
      if (setCartItems) {
        setCartItems([]);
      }
      
      // Reset form
      setCustomerInfo({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'Nigeria'
      });
      setSpecialInstructions('');
      
      if (showNotification) {
        showNotification(`Order placed successfully! Order #${orderId}`, 'success');
      }

    } catch (error) {
      console.error('Order creation failed:', error);
      if (showNotification) {
        showNotification(`Failed to place order: ${error.message}`, 'error');
      }
    } finally {
      setIsProcessingOrder(false);
      setOrderProgress(0);
    }
  };

  // Email confirmation function
  const sendOrderConfirmationEmail = async (order) => {
    try {
      const emailData = {
        to: order.customerEmail || customerInfo.email,
        subject: `Order Confirmation - ${order.id}`,
        orderDetails: {
          orderId: order.id,
          customerName: order.customerName || customerInfo.name,
          items: order.productDetails || cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity || 1,
            unit: item.unit,
            price: item.price,
            total: (item.quantity || 1) * item.price
          })),
          total: order.total,
          deliveryAddress: order.deliveryAddress || {
            address: customerInfo.address,
            city: customerInfo.city,
            state: customerInfo.state,
            country: customerInfo.country
          },
          paymentMethod: order.paymentMethod || paymentMethod,
          orderDate: order.orderDate || new Date().toISOString().split('T')[0]
        }
      };

      // Try to send via API
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/orders/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('agrohub_token')}`
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error('Email service unavailable');
      }

      console.log('✅ Order confirmation email sent successfully');
    } catch (error) {
      console.warn('⚠️ Email sending failed:', error);
      // Email failure shouldn't prevent order creation
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container>
        <div className="text-center py-5">
          {/* Animated Empty Cart */}
          <div className="mb-4 position-relative">
            <div 
              className="d-inline-block"
              style={{ 
                fontSize: '8rem', 
                opacity: 0.6,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}
            >
              🛒
            </div>
            <div 
              className="position-absolute"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '2rem',
                opacity: 0.3
              }}
            >
              💨
            </div>
          </div>
          
          <div className="mb-4">
            <h2 className="text-muted mb-3 fw-bold">Your AgroHub Cart is Empty</h2>
            <p className="text-muted mb-4 lead" style={{ maxWidth: '500px', margin: '0 auto' }}>
              Ready to fill your cart with fresh, locally-sourced products? 
              <br />Discover amazing produce from trusted farmers in your area!
            </p>
          </div>

          {user && (
            <div className="d-grid gap-3 d-sm-flex justify-content-sm-center mb-5">
              <Button 
                variant="success" 
                size="lg"
                onClick={() => window.location.reload()}
                className="px-4 py-3 shadow-sm"
                style={{ borderRadius: '25px' }}
              >
                <i className="fas fa-leaf me-2"></i>
                Start Shopping
              </Button>
              <Button 
                variant="outline-success" 
                size="lg"
                onClick={() => window.location.href = '#/farmers'}
                className="px-4 py-3"
                style={{ borderRadius: '25px' }}
              >
                <i className="fas fa-users me-2"></i>
                Browse Farmers
              </Button>
            </div>
          )}
          
          {/* Feature highlights */}
          <div className="row mt-5 justify-content-center">
            <div className="col-md-3 col-6 mb-4">
              <div className="p-3">
                <div className="text-success mb-3" style={{ fontSize: '2.5rem' }}>🌱</div>
                <h6 className="fw-bold">Fresh & Organic</h6>
                <p className="small text-muted mb-0">Directly from local farms</p>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-4">
              <div className="p-3">
                <div className="text-success mb-3" style={{ fontSize: '2.5rem' }}>🚚</div>
                <h6 className="fw-bold">Fast Delivery</h6>
                <p className="small text-muted mb-0">Same or next day delivery</p>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-4">
              <div className="p-3">
                <div className="text-success mb-3" style={{ fontSize: '2.5rem' }}>💳</div>
                <h6 className="fw-bold">Secure Payment</h6>
                <p className="small text-muted mb-0">Cash on delivery available</p>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-4">
              <div className="p-3">
                <div className="text-success mb-3" style={{ fontSize: '2.5rem' }}>🤝</div>
                <h6 className="fw-bold">Support Farmers</h6>
                <p className="small text-muted mb-0">Direct from producer to you</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="px-3">
      {checkoutAlert && (
        <Alert variant="success" className="mb-4">
          <i className="fas fa-check-circle me-2"></i>
          {checkoutAlert}
        </Alert>
      )}

      {/* Cart Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-success mb-1">
            <i className="fas fa-shopping-cart me-2"></i>
            Shopping Cart
          </h2>
          <p className="text-muted mb-0">Review your items and checkout when ready</p>
        </div>
        <div className="text-end">
          <Badge bg="primary" className="fs-6 px-3 py-2">
            <i className="fas fa-box me-1"></i>
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          {/* Cart Items */}
          <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
            <Card.Header className="bg-gradient text-white border-0" style={{ 
              background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)',
              borderRadius: '15px 15px 0 0'
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-shopping-basket me-2"></i>
                  Your Fresh Selection
                </h5>
                <Badge bg="light" text="success" className="fs-6 px-3 py-2 rounded-pill">
                  <i className="fas fa-leaf me-1"></i>
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 ps-4 py-3 text-muted text-uppercase small fw-bold">
                        <i className="fas fa-box me-2"></i>Product Details
                      </th>
                      <th className="border-0 py-3 text-center text-muted text-uppercase small fw-bold">
                        <i className="fas fa-tag me-2"></i>Unit Price
                      </th>
                      <th className="border-0 py-3 text-center text-muted text-uppercase small fw-bold">
                        <i className="fas fa-calculator me-2"></i>Quantity
                      </th>
                      <th className="border-0 py-3 text-center text-muted text-uppercase small fw-bold">
                        <i className="fas fa-receipt me-2"></i>Subtotal
                      </th>
                      <th className="border-0 py-3 text-center text-muted text-uppercase small fw-bold">
                        <i className="fas fa-cog me-2"></i>Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, index) => (
                      <tr 
                        key={index} 
                        className="align-middle border-0" 
                        style={{ 
                          borderBottom: '1px solid #f0f0f0',
                          transition: 'all 0.2s ease',
                          cursor: 'default'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.transform = '';
                        }}
                      >
                        <td className="ps-4 py-4">
                          <div className="d-flex align-items-center">
                            <div className="me-3 position-relative">
                              <div 
                                className="d-flex align-items-center justify-content-center bg-light rounded-3 border"
                                style={{ 
                                  fontSize: '3rem', 
                                  width: '80px', 
                                  height: '80px',
                                  minWidth: '80px'
                                }}
                              >
                                {item.image}
                              </div>
                              {item.stock && item.stock <= 5 && (
                                <Badge 
                                  bg="warning" 
                                  className="position-absolute top-0 start-100 translate-middle small"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  <i className="fas fa-exclamation-triangle"></i>
                                </Badge>
                              )}
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-2 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                {item.name}
                              </h6>
                              <div className="d-flex align-items-center mb-2">
                                <i className="fas fa-user-tie me-2 text-success"></i>
                                <small className="text-muted">
                                  by <strong>{item.farmer || 'Local Farmer'}</strong>
                                </small>
                              </div>
                              <div className="d-flex gap-2 flex-wrap">
                                {item.stock && (
                                  <>
                                    {item.stock > 10 ? (
                                      <Badge bg="success" className="small">
                                        <i className="fas fa-check me-1"></i>
                                        In Stock
                                      </Badge>
                                    ) : (
                                      <Badge bg="warning" className="small">
                                        <i className="fas fa-exclamation-triangle me-1"></i>
                                        Limited Stock
                                      </Badge>
                                    )}
                                  </>
                                )}
                                {item.organic && (
                                  <Badge bg="success" className="small">
                                    <i className="fas fa-leaf me-1"></i>
                                    Organic
                                  </Badge>
                                )}
                                {item.location && (
                                  <Badge bg="info" className="small">
                                    <i className="fas fa-map-marker-alt me-1"></i>
                                    {item.location}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-4">
                          <div className="text-success fw-bold fs-5">
                            ₦{item.price.toLocaleString()}
                          </div>
                          <small className="text-muted d-block mt-1">
                            per {item.unit}
                          </small>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <small className="text-decoration-line-through text-muted d-block">
                              ₦{item.originalPrice.toLocaleString()}
                            </small>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center justify-content-center" style={{ minWidth: '160px' }}>
                            <div className="input-group" style={{ maxWidth: '140px' }}>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                                disabled={isProcessingOrder || (item.quantity || 1) <= 1}
                                className="border-end-0"
                                style={{ borderRadius: '8px 0 0 8px', minWidth: '35px' }}
                              >
                                <i className="fas fa-minus"></i>
                              </Button>
                              <div className="form-control text-center fw-bold border-success" 
                                   style={{ 
                                     maxWidth: '60px', 
                                     fontSize: '1.1rem',
                                     backgroundColor: '#f8f9fa',
                                     borderRadius: '0'
                                   }}>
                                {item.quantity || 1}
                              </div>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                                disabled={isProcessingOrder || (item.stock && (item.quantity || 1) >= item.stock)}
                                className="border-start-0"
                                style={{ borderRadius: '0 8px 8px 0', minWidth: '35px' }}
                              >
                                <i className="fas fa-plus"></i>
                              </Button>
                            </div>
                          </div>
                          <div className="text-center mt-1">
                            <small className="text-muted">{item.unit}(s)</small>
                          </div>
                        </td>
                        <td className="text-center py-4">
                          <div className="fw-bold text-success fs-5">
                            ₦{((item.totalPrice || (item.price * (item.quantity || 1)))).toLocaleString()}
                          </div>
                          <small className="text-muted d-block">
                            {item.quantity || 1} × ₦{item.price.toLocaleString()}
                          </small>
                        </td>
                        <td className="text-center py-4">
                          <div className="d-flex flex-column gap-2 align-items-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleRemoveFromCart(item.id)}
                              title="Remove from cart"
                              disabled={isProcessingOrder}
                              className="rounded-pill"
                              style={{ width: '40px', height: '40px' }}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </Button>
                            <small className="text-muted">Remove</small>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Order Summary Sidebar */}
          <div className="sticky-top" style={{ top: '20px' }}>
            <Card className="shadow-sm">
              <Card.Header className="bg-success text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-receipt me-2"></i>
                    Order Summary
                  </h5>
                  <Badge bg="light" text="dark" className="fs-6">
                    {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                  <span>Subtotal:</span>
                  <span className="fw-bold">₦{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                  <span>
                    <i className="fas fa-truck me-1"></i>
                    Delivery Fee:
                  </span>
                  <span>₦500</span>
                </div>
                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold fs-5">Total:</span>
                  <span className="fw-bold fs-4 text-success">₦{(getTotalPrice() + 500).toLocaleString()}</span>
                </div>
                
                <div className="d-grid gap-2">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => setShowCheckoutModal(true)}
                    disabled={!user || isProcessingOrder}
                    className="py-3"
                  >
                    {isProcessingOrder ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-credit-card me-2"></i>
                        Proceed to Checkout
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline-success"
                    onClick={() => window.location.reload()}
                    disabled={isProcessingOrder}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Continue Shopping
                  </Button>
                </div>
                
                {!user && (
                  <Alert variant="warning" className="mt-3 small mb-0">
                    <i className="fas fa-sign-in-alt me-1"></i>
                    Please login to complete your order
                  </Alert>
                )}

                {/* Benefits */}
                <div className="mt-4 pt-3 border-top">
                  <h6 className="text-success mb-3">
                    <i className="fas fa-shield-alt me-2"></i>
                    Why Choose Us?
                  </h6>
                  <div className="small">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <span>Fresh from local farmers</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <span>Same day delivery available</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <span>Cash on delivery option</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <span>Money back guarantee</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Enhanced Checkout Modal */}
      <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <i className="fas fa-shopping-cart me-2"></i>
            Complete Your Order
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCheckout}>
          <Modal.Body className="p-4">
            {isProcessingOrder && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Processing Order...</span>
                  <span>{orderProgress}%</span>
                </div>
                <ProgressBar now={orderProgress} variant="success" />
              </div>
            )}
            
            <Row>
              <Col lg={7} md={12}>
                <h5 className="text-success mb-4">
                  <i className="fas fa-user me-2"></i>
                  Customer Information
                </h5>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        placeholder="Enter your full name"
                        disabled={isProcessingOrder}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        required
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        placeholder="your.email@example.com"
                        disabled={isProcessingOrder}
                      />
                      <Form.Text className="text-muted">
                        Order confirmation will be sent to this email
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-4">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    placeholder="e.g., +234XXXXXXXXXX"
                    disabled={isProcessingOrder}
                  />
                </Form.Group>

                <h5 className="text-success mb-3">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Delivery Address
                </h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Street Address *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    placeholder="House number, street name"
                    disabled={isProcessingOrder}
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                        placeholder="Enter city"
                        disabled={isProcessingOrder}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State *</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        value={customerInfo.state}
                        onChange={(e) => setCustomerInfo({...customerInfo, state: e.target.value})}
                        placeholder="Enter state"
                        disabled={isProcessingOrder}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method</Form.Label>
                      <Form.Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={isProcessingOrder}
                      >
                        <option value="Cash on Delivery">Cash on Delivery</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Mobile Money">Mobile Money</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    {user?.address && (
                      <div className="mb-3">
                        <Form.Label>Quick Fill</Form.Label>
                        <div>
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            onClick={() => {
                              setCustomerInfo({
                                ...customerInfo,
                                address: user.address.street || '',
                                city: user.address.city || '',
                                state: user.address.state || '',
                                country: user.address.country || 'Nigeria'
                              });
                            }}
                            disabled={isProcessingOrder}
                          >
                            <i className="fas fa-user me-1"></i>
                            Use Profile Address
                          </Button>
                        </div>
                      </div>
                    )}
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Special Instructions (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special delivery instructions or notes..."
                    disabled={isProcessingOrder}
                  />
                </Form.Group>
              </Col>
              
              <Col lg={5} md={12} className="mt-4 mt-lg-0">
                <div className="sticky-top">
                  <h5 className="text-success mb-3">
                    <i className="fas fa-receipt me-2"></i>
                    Order Summary
                  </h5>
                  <Card className="shadow-sm border-success">
                    <Card.Body>
                      {/* Cart Items Display */}
                      <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {cartItems && cartItems.length > 0 ? (
                          cartItems.map((item, index) => (
                            <div key={item.id || index} className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                              <div className="d-flex align-items-center">
                                <span className="me-2" style={{ fontSize: '1.5rem' }}>{item.image || '🥬'}</span>
                                <div>
                                  <div className="fw-medium small">{item.name || 'Product'}</div>
                                  <div className="text-muted small">
                                    {item.quantity || 1} × ₦{(item.price || 0).toLocaleString()}/{item.unit || 'unit'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-success fw-bold">
                                ₦{((item.quantity || 1) * (item.price || 0)).toLocaleString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-3 text-muted">
                            <i className="fas fa-shopping-cart fa-2x mb-2"></i>
                            <p className="mb-0">No items in cart</p>
                            <small>Add items to see summary</small>
                          </div>
                        )}
                      </div>
                      
                      <hr />
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}):</span>
                        <span className="fw-bold">₦{getTotalPrice().toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Delivery Fee:</span>
                        <span>₦500</span>
                      </div>
                      {/* Debug info - remove in production */}
                      {cartItems && cartItems.length > 0 && (
                        <div className="small text-success mb-2 p-2 bg-light rounded">
                          <strong>Cart Debug:</strong> {cartItems.length} items, Total: ₦{getTotalPrice().toLocaleString()}
                        </div>
                      )}
                      <hr />
                      <div className="d-flex justify-content-between mb-3">
                        <span className="fw-bold fs-5">Total:</span>
                        <span className="fw-bold fs-5 text-success">₦{(getTotalPrice() + 500).toLocaleString()}</span>
                      </div>

                      {paymentMethod === 'Bank Transfer' && (
                        <Alert variant="info" className="small">
                          <i className="fas fa-info-circle me-1"></i>
                          Bank transfer details will be sent via email after order confirmation.
                        </Alert>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button 
              variant="secondary" 
              onClick={() => setShowCheckoutModal(false)}
              disabled={isProcessingOrder}
            >
              Cancel
            </Button>
            <Button 
              variant="success" 
              type="submit" 
              disabled={isProcessingOrder}
              className="px-4"
            >
              {isProcessingOrder ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-check me-2"></i>
                  Place Order (₦{(getTotalPrice() + 500).toLocaleString()})
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Remove Item Confirmation Modal */}
      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Remove Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {itemToRemove && (
            <div className="text-center">
              <div className="mb-3">
                <span style={{ fontSize: '3rem' }}>{itemToRemove.image}</span>
              </div>
              <h5>Remove {itemToRemove.name}?</h5>
              <p className="text-muted">
                Are you sure you want to remove this item from your cart?
              </p>
              <div className="bg-light p-3 rounded">
                <div className="d-flex justify-content-between">
                  <span>Quantity:</span>
                  <span>{itemToRemove.quantity || 1} {itemToRemove.unit}(s)</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Price:</span>
                  <span>₦{((itemToRemove.totalPrice || (itemToRemove.price * (itemToRemove.quantity || 1)))).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmRemoveItem}>
            <i className="fas fa-trash-alt me-1"></i>
            Remove Item
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Success Modal */}
      <Modal show={showOrderSuccess} onHide={() => setShowOrderSuccess(false)} centered size="lg">
        <Modal.Body className="text-center p-5">
          <div className="mb-4">
            <div className="text-success" style={{ fontSize: '4rem' }}>
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <h3 className="text-success mb-3">Order Placed Successfully! 🎉</h3>
          <p className="lead mb-4">
            Thank you for your order! Your order <strong>#{lastOrderId}</strong> has been confirmed.
          </p>
          
          <div className="bg-light rounded p-4 mb-4">
            <Row>
              <Col md={6}>
                <div className="text-start">
                  <h6 className="text-success">📧 Email Confirmation</h6>
                  <p className="small text-muted mb-0">
                    Order details and tracking information have been sent to <strong>{customerInfo.email}</strong>
                  </p>
                </div>
              </Col>
              <Col md={6}>
                <div className="text-start">
                  <h6 className="text-success">🚚 What's Next?</h6>
                  <p className="small text-muted mb-0">
                    Our farmers will prepare your order. You'll receive updates via email and SMS.
                  </p>
                </div>
              </Col>
            </Row>
          </div>

          <div className="d-grid gap-2 d-md-flex justify-content-md-center">
            <Button 
              variant="success" 
              onClick={() => {
                setShowOrderSuccess(false);
                // Navigate to orders page or dashboard
                window.location.href = '#/orders';
              }}
            >
              <i className="fas fa-list me-2"></i>
              View My Orders
            </Button>
            <Button 
              variant="outline-success" 
              onClick={() => {
                setShowOrderSuccess(false);
                // Continue shopping
                window.location.reload();
              }}
            >
              <i className="fas fa-shopping-bag me-2"></i>
              Continue Shopping
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ShoppingCart;
