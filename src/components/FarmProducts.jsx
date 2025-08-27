import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { productsAPI, ordersAPI } from '../services/api';

function FarmProducts({ cartItems, setCartItems, user, onShowAuth }) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderAlert, setOrderAlert] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getProducts();
        setProducts(response.data || []);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products. Please try again.');
        // Fallback to local products if API fails
        setProducts(getFallbackProducts());
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Fallback products if API is not available
  const getFallbackProducts = () => [
    {
      id: 1,
      name: 'Fresh Tomatoes',
      price: 2500,
      unit: 'kg',
      stock: 150,
      farmer: 'Adebayo Farms',
      location: 'Lagos State',
      description: 'Fresh, organic tomatoes harvested daily',
      image: '🍅',
      category: 'Vegetables',
      quality: 'Premium'
    },
    {
      id: 2,
      name: 'White Rice',
      price: 1200,
      unit: 'kg',
      stock: 500,
      farmer: 'Plateau Rice Mills',
      location: 'Plateau State',
      description: 'Premium quality parboiled rice',
      image: '🌾',
      category: 'Grains',
      quality: 'Premium'
    },
    {
      id: 3,
      name: 'Yellow Maize',
      price: 800,
      unit: 'kg',
      stock: 300,
      farmer: 'Kano Agric Co-op',
      location: 'Kano State',
      description: 'Dry season yellow maize, excellent quality',
      image: '🌽',
      category: 'Grains',
      quality: 'Standard'
    },
    {
      id: 4,
      name: 'Sweet Potatoes',
      price: 1800,
      unit: 'kg',
      stock: 80,
      farmer: 'Jos Highland Farms',
      location: 'Plateau State',
      description: 'Sweet, nutritious potatoes from highland farms',
      image: '🍠',
      category: 'Tubers',
      quality: 'Premium'
    },
    {
      id: 5,
      name: 'Fresh Pepper',
      price: 3500,
      unit: 'kg',
      stock: 45,
      farmer: 'Ogun Spice Gardens',
      location: 'Ogun State',
      description: 'Hot fresh pepper, perfect for cooking',
      image: '🌶️',
      category: 'Spices',
      quality: 'Premium'
    },
    {
      id: 6,
      name: 'Plantains',
      price: 1500,
      unit: 'kg',
      stock: 120,
      farmer: 'Cross River Plantain Estate',
      location: 'Cross River State',
      description: 'Green and ripe plantains available',
      image: '🍌',
      category: 'Fruits',
      quality: 'Standard'
    },
    {
      id: 7,
      name: 'Garden Eggs',
      price: 2200,
      unit: 'kg',
      stock: 60,
      farmer: 'Enugu Vegetable Cooperative',
      location: 'Enugu State',
      description: 'Fresh garden eggs, locally grown',
      image: '🍆',
      category: 'Vegetables',
      quality: 'Premium'
    },
    {
      id: 8,
      name: 'Groundnuts',
      price: 2800,
      unit: 'kg',
      stock: 200,
      farmer: 'Kaduna Groundnut Association',
      location: 'Kaduna State',
      description: 'Roasted and raw groundnuts available',
      image: '🥜',
      category: 'Nuts',
      quality: 'Premium'
    },
    {
      id: 9,
      name: 'Fresh Okra',
      price: 1800,
      unit: 'kg',
      stock: 35,
      farmer: 'Kwara Green Fields',
      location: 'Kwara State',
      description: 'Tender fresh okra, perfect for soups',
      image: '🌿',
      category: 'Vegetables',
      quality: 'Standard'
    },
    {
      id: 10,
      name: 'Coconuts',
      price: 500,
      unit: 'piece',
      stock: 300,
      farmer: 'Lagos Coconut Grove',
      location: 'Lagos State',
      description: 'Fresh coconuts, great for cooking and drinking',
      image: '🥥',
      category: 'Fruits',
      quality: 'Premium'
    },
    {
      id: 11,
      name: 'Fresh Spinach',
      price: 1200,
      unit: 'kg',
      stock: 75,
      farmer: 'Abuja Green Farms',
      location: 'FCT Abuja',
      description: 'Organic spinach leaves, rich in iron',
      image: '🥬',
      category: 'Vegetables',
      quality: 'Premium'
    },
    {
      id: 12,
      name: 'Yams',
      price: 2000,
      unit: 'kg',
      stock: 150,
      farmer: 'Benue Yam Farmers',
      location: 'Benue State',
      description: 'Quality yams from the food basket of the nation',
      image: '🍠',
      category: 'Tubers',
      quality: 'Premium'
    },
    {
      id: 13,
      name: 'Fresh Carrots',
      price: 1800,
      unit: 'kg',
      stock: 90,
      farmer: 'Plateau Vegetable Gardens',
      location: 'Plateau State',
      description: 'Crunchy orange carrots, perfect for salads',
      image: '🥕',
      category: 'Vegetables',
      quality: 'Premium'
    },
    {
      id: 14,
      name: 'Cashew Nuts',
      price: 4500,
      unit: 'kg',
      stock: 25,
      farmer: 'Kogi Cashew Cooperative',
      location: 'Kogi State',
      description: 'Premium cashew nuts, locally processed',
      image: '🥜',
      category: 'Nuts',
      quality: 'Premium'
    },
    {
      id: 15,
      name: 'Fresh Onions',
      price: 1600,
      unit: 'kg',
      stock: 200,
      farmer: 'Sokoto Onion Farms',
      location: 'Sokoto State',
      description: 'Red and white onions, essential for cooking',
      image: '🧅',
      category: 'Vegetables',
      quality: 'Standard'
    },
    {
      id: 16,
      name: 'Palm Oil',
      price: 3200,
      unit: 'liter',
      stock: 40,
      farmer: 'Akwa Ibom Palm Estate',
      location: 'Akwa Ibom State',
      description: 'Pure red palm oil, naturally extracted',
      image: '🫒',
      category: 'Oils',
      quality: 'Premium'
    },
    {
      id: 17,
      name: 'Fresh Ginger',
      price: 2800,
      unit: 'kg',
      stock: 55,
      farmer: 'Kaduna Spice Farm',
      location: 'Kaduna State',
      description: 'Fresh ginger root, great for health and cooking',
      image: '🫚',
      category: 'Spices',
      quality: 'Premium'
    },
    {
      id: 18,
      name: 'Watermelons',
      price: 1200,
      unit: 'piece',
      stock: 100,
      farmer: 'Kano Fruit Gardens',
      location: 'Kano State',
      description: 'Sweet, juicy watermelons perfect for hot weather',
      image: '🍉',
      category: 'Fruits',
      quality: 'Standard'
    },
    {
      id: 19,
      name: 'Black Beans',
      price: 1800,
      unit: 'kg',
      stock: 180,
      farmer: 'Oyo Bean Farmers',
      location: 'Oyo State',
      description: 'Quality black-eyed beans, rich in protein',
      image: '🫘',
      category: 'Legumes',
      quality: 'Standard'
    },
    {
      id: 20,
      name: 'Fresh Cucumber',
      price: 1400,
      unit: 'kg',
      stock: 85,
      farmer: 'Rivers Cucumber Farm',
      location: 'Rivers State',
      description: 'Crisp cucumbers, perfect for salads',
      image: '🥒',
      category: 'Vegetables',
      quality: 'Premium'
    },
    {
      id: 21,
      name: 'Pineapples',
      price: 800,
      unit: 'piece',
      stock: 70,
      farmer: 'Edo Fruit Plantation',
      location: 'Edo State',
      description: 'Sweet tropical pineapples, vitamin C rich',
      image: '🍍',
      category: 'Fruits',
      quality: 'Premium'
    },
    {
      id: 22,
      name: 'Cassava Flour',
      price: 900,
      unit: 'kg',
      stock: 250,
      farmer: 'Ondo Cassava Mills',
      location: 'Ondo State',
      description: 'Fine cassava flour for bread and pastries',
      image: '🌾',
      category: 'Flour',
      quality: 'Standard'
    },
    {
      id: 23,
      name: 'Fresh Lettuce',
      price: 1500,
      unit: 'kg',
      stock: 45,
      farmer: 'Jos Salad Gardens',
      location: 'Plateau State',
      description: 'Crispy lettuce leaves for fresh salads',
      image: '🥬',
      category: 'Vegetables',
      quality: 'Premium'
    },
    {
      id: 24,
      name: 'Honey',
      price: 5500,
      unit: 'liter',
      stock: 20,
      farmer: 'Kwara Bee Farmers',
      location: 'Kwara State',
      description: 'Pure natural honey from forest bees',
      image: '🍯',
      category: 'Natural',
      quality: 'Premium'
    }
  ];

  const handleDetailsClick = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleOrderClick = (product) => {
    if (!user) {
      setOrderAlert('Please login to add items to cart');
      onShowAuth();
      setTimeout(() => setOrderAlert(''), 3000);
      return;
    }
    
    setSelectedProduct(product);
    setQuantity(1);
    setShowDetailsModal(false); // Close details modal if open
    setShowOrderModal(true);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      setOrderAlert('Please login to add items to cart');
      onShowAuth();
      setShowOrderModal(false);
      setTimeout(() => setOrderAlert(''), 3000);
      return;
    }

    try {
      // Create order via API
      const orderData = {
        productId: selectedProduct.id,
        quantity: quantity,
        customerName: user.name,
        customerPhone: user.phone || '+234000000000',
        deliveryAddress: {
          street: user.address?.street || 'Not specified',
          city: user.address?.city || 'Lagos',
          state: user.address?.state || 'Lagos State',
          country: user.address?.country || 'Nigeria'
        }
      };

      const response = await ordersAPI.createOrder(orderData);
      
      if (response.success) {
        setOrderAlert(`Order placed successfully! Order #${response.data.orderNumber}`);
        setShowOrderModal(false);
        setTimeout(() => setOrderAlert(''), 5000);
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      // Fallback to cart logic
      const cartItem = {
        ...selectedProduct,
        orderQuantity: quantity,
        quantity: quantity, // Add both for compatibility
        totalPrice: selectedProduct.price * quantity,
        userId: user.id,
        addedAt: new Date().toISOString()
      };
      
      setCartItems(prevCart => [...prevCart, cartItem]);
      setOrderAlert('Added to cart! (Order API temporarily unavailable)');
      setShowOrderModal(false);
      setTimeout(() => setOrderAlert(''), 3000);
    }
  };
    
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.orderQuantity, 0);
  };

  return (
    <div>
      {orderAlert && (
        <Alert variant="success" className="mb-4">
          {orderAlert}
        </Alert>
      )}

      {error && (
        <Alert variant="warning" className="mb-4">
          {error}
        </Alert>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="info" className="fs-6">
            {loading ? 'Loading...' : `${products.length} Products Available`}
          </Badge>
          {cartItems.length > 0 && (
            <div className="bg-success text-white px-3 py-2 rounded">
              {/* 🛍️ Cart: {getCartItemCount()} items - ₦{getCartTotal().toLocaleString()} */}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading products...</span>
          </div>
          <p className="mt-3 text-muted">Loading fresh products...</p>
        </div>
      ) : (
        <Row>
          {products.map((product) => (
            <Col xl={3} lg={4} md={6} key={product.id} className="mb-3">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="d-flex flex-column p-3">
                  <div className="text-center mb-2">
                    <span style={{ fontSize: '2.5rem' }}>{product.image}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="h6 mb-0 text-truncate">{product.name}</Card.Title>
                  <Badge bg={product.quality === 'Premium' ? 'success' : 'secondary'} className="small">
                    {product.quality}
                  </Badge>
                </div>
                
                <div className="mb-2">
                  <span className="text-success fw-bold">
                    ₦{product.price.toLocaleString()}
                  </span>
                  <small className="text-muted">/{product.unit}</small>
                </div>
                
                <Card.Text className="text-muted small flex-grow-1">
                  <div className="text-truncate mb-1">{product.description}</div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-success">
                      {product.stock > 50 ? '✅ In Stock' : product.stock > 20 ? '⚠️ Limited' : product.stock > 0 ? '🔴 Few Left' : '❌ Out of Stock'}
                    </small>
                    <small className="text-muted">
                      {product.stock} {product.unit}(s)
                    </small>
                  </div>
                </Card.Text>
                
                <div className="mb-2">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span className="text-truncate">👨‍🌾 {product.farmer}</span>
                    <Badge bg="light" text="dark" className="small">{product.category}</Badge>
                  </div>
                  <div className="small text-muted text-truncate">
                    📍 {product.location}
                  </div>
                </div>
                
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleDetailsClick(product)}
                  className="w-100"
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
        </Row>
      )}

      {/* Product Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '2rem' }}>{selectedProduct?.image}</span>
            {selectedProduct?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div>
              <Row>
                <Col md={6}>
                  <div className="text-center mb-4">
                    <span style={{ fontSize: '8rem' }}>{selectedProduct.image}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <h5 className="text-success">₦{selectedProduct.price.toLocaleString()}</h5>
                    <small className="text-muted">per {selectedProduct.unit}</small>
                  </div>
                  
                  <div className="mb-3">
                    <Badge bg={selectedProduct.quality === 'Premium' ? 'success' : 'secondary'} className="mb-2">
                      {selectedProduct.quality} Quality
                    </Badge>
                    <Badge bg="light" text="dark" className="ms-2">
                      {selectedProduct.category}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <p className="text-muted">{selectedProduct.description}</p>
                  </div>

                  <div className="bg-light p-3 rounded mb-3">
                    <h6 className="mb-2">📋 Product Information</h6>
                    <div className="row">
                      <div className="col-6">
                        <small className="text-muted d-block">Stock Available</small>
                        <span className={`fw-medium ${selectedProduct.stock > 50 ? 'text-success' : selectedProduct.stock > 20 ? 'text-warning' : 'text-danger'}`}>
                          {selectedProduct.stock} {selectedProduct.unit}(s)
                        </span>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Category</small>
                        <span>{selectedProduct.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-light p-3 rounded mb-3">
                    <h6 className="mb-2">👨‍🌾 Farmer Information</h6>
                    <div className="mb-1">
                      <strong>Farm:</strong> {selectedProduct.farmer}
                    </div>
                    <div className="mb-1">
                      <strong>Location:</strong> {selectedProduct.location}
                    </div>
                    <div className="small text-muted">
                      📱 Contact farmer through our platform for bulk orders
                    </div>
                  </div>

                  {selectedProduct.stock === 0 && (
                    <Alert variant="warning" className="mb-3">
                      <strong>Out of Stock</strong> - This product is currently unavailable.
                    </Alert>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedProduct && selectedProduct.stock > 0 && (
            user ? (
              <Button variant="success" onClick={() => handleOrderClick(selectedProduct)}>
                🛒 Add to Cart
              </Button>
            ) : (
              <Button variant="primary" onClick={() => {
                setShowDetailsModal(false);
                onShowAuth();
              }}>
                Login to Order
              </Button>
            )
          )}
        </Modal.Footer>
      </Modal>

      {/* Order Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add to Cart - {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div>
              <div className="text-center mb-3">
                <span style={{ fontSize: '4rem' }}>{selectedProduct.image}</span>
              </div>
              
              <div className="mb-3">
                <strong>Farmer:</strong> {selectedProduct.farmer}<br/>
                <strong>Location:</strong> {selectedProduct.location}<br/>
                <strong>Price:</strong> ₦{selectedProduct.price.toLocaleString()}/{selectedProduct.unit}<br/>
                <strong>Available:</strong> {selectedProduct.stock} {selectedProduct.unit}(s)
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Quantity ({selectedProduct.unit}s)</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Form.Control
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={(e) => {
                      const newQty = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(1, newQty), selectedProduct.stock));
                    }}
                    style={{ width: '80px', textAlign: 'center' }}
                    className="mx-2"
                  />
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                    disabled={quantity >= selectedProduct.stock}
                  >
                    +
                  </Button>
                </div>
                <Form.Text className="text-muted">
                  Maximum available: {selectedProduct.stock} {selectedProduct.unit}(s)
                </Form.Text>
              </Form.Group>
              
              <div className="bg-light p-3 rounded mb-3">
                <div className="d-flex justify-content-between">
                  <span>Subtotal:</span>
                  <span className="fw-bold">₦{(selectedProduct.price * quantity).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Delivery:</span>
                  <span>₦500</span>
                </div>
                <hr className="my-2"/>
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Total:</span>
                  <span className="fw-bold text-success">₦{(selectedProduct.price * quantity + 500).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handlePlaceOrder}>
            Add to Cart
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default FarmProducts;
