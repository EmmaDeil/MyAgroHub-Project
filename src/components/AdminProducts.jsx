import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Alert, Table, Badge, InputGroup } from 'react-bootstrap';
import { productsAPI } from '../services/api';
import AdminNavbar from './AdminNavbar';

const AdminProducts = ({ user, onLogout, onNavigate }) => {
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    unit: 'kg',
    stock: '',
    farmer: '',
    location: '',
    image: '',
    organic: false,
    featured: false
  });

  const categories = [
    'Vegetables', 'Fruits', 'Grains', 'Livestock', 'Dairy', 'Herbs & Spices', 'Seeds', 'Other'
  ];

  const units = ['kg', 'g', 'pieces', 'bunches', 'liters', 'bags', 'crates'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      // Load sample data if API fails
      setProducts(getSampleProducts());
    }
  };

  const getSampleProducts = () => [
    {
      id: 1,
      name: 'Fresh Tomatoes',
      description: 'Juicy red tomatoes perfect for cooking',
      price: 2500,
      category: 'Vegetables',
      unit: 'kg',
      stock: 50,
      farmer: 'Adebayo Farms',
      location: 'Lagos State',
      image: '/api/placeholder/300/200',
      organic: true,
      featured: true,
      status: 'active'
    },
    {
      id: 2,
      name: 'White Rice',
      description: 'Premium quality white rice',
      price: 45000,
      category: 'Grains',
      unit: 'bags',
      stock: 25,
      farmer: 'Plateau Rice Mills',
      location: 'Plateau State',
      image: '/api/placeholder/300/200',
      organic: false,
      featured: true,
      status: 'active'
    },
    {
      id: 3,
      name: 'Yellow Maize',
      description: 'Fresh yellow corn for various uses',
      price: 35000,
      category: 'Grains',
      unit: 'bags',
      stock: 15,
      farmer: 'Kano Agric Co-op',
      location: 'Kano State',
      image: '/api/placeholder/300/200',
      organic: false,
      featured: false,
      status: 'active'
    }
  ];

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      unit: 'kg',
      stock: '',
      farmer: '',
      location: '',
      image: '',
      organic: false,
      featured: false
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      unit: product.unit,
      stock: product.stock.toString(),
      farmer: product.farmer,
      location: product.location,
      image: product.image,
      organic: product.organic,
      featured: product.featured
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        id: editingProduct ? editingProduct.id : Date.now(),
        status: 'active'
      };

      if (editingProduct) {
        // Update existing product
        setProducts(products.map(p => p.id === editingProduct.id ? productData : p));
        showAlert('Product updated successfully!');
      } else {
        // Add new product
        setProducts([...products, productData]);
        showAlert('Product added successfully!');
      }

      setShowProductModal(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      showAlert('Failed to save product', 'danger');
    }
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
      showAlert('Product deleted successfully!');
    }
  };

  const handleToggleStatus = (productId) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    ));
    showAlert('Product status updated!');
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <Badge bg="success">Active</Badge>
      : <Badge bg="secondary">Inactive</Badge>;
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <Badge bg="danger">Out of Stock</Badge>;
    if (stock < 10) return <Badge bg="warning">Low Stock</Badge>;
    return <Badge bg="success">In Stock</Badge>;
  };

  return (
    <div>
      {/* Admin Navigation Bar */}
      <AdminNavbar 
        user={user} 
        onLogout={onLogout}
        onNavigate={onNavigate}
      />
      
      {/* Main Product Management Content */}
      <div className="container-fluid px-0 min-vh-100">
        <div className="row g-0 min-vh-100">
          <div className="col-12 px-4 py-5 bg-light">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5">
              <div>
                <h1 className="display-4 text-success mb-2">🏪 Product Management</h1>
                <p className="lead text-muted">Manage your farm store inventory and products</p>
              </div>
              <Button 
                variant="success" 
                size="lg"
                onClick={handleAddProduct}
                className="shadow"
              >
                <i className="fas fa-plus me-2"></i>
                Add New Product
              </Button>
            </div>

            {alert.show && (
              <Alert variant={alert.variant} className="mb-4">
                {alert.message}
              </Alert>
            )}

            {/* Product Statistics */}
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body>
                    <h2 className="text-primary">{products.length}</h2>
                    <p className="text-muted mb-0">Total Products</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body>
                    <h2 className="text-success">{products.filter(p => p.status === 'active').length}</h2>
                    <p className="text-muted mb-0">Active Products</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body>
                    <h2 className="text-warning">{products.filter(p => p.stock < 10).length}</h2>
                    <p className="text-muted mb-0">Low Stock Items</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body>
                    <h2 className="text-danger">{products.filter(p => p.stock === 0).length}</h2>
                    <p className="text-muted mb-0">Out of Stock</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Products Table */}
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-boxes me-2"></i>
                  Products Inventory
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price (₦)</th>
                        <th>Stock</th>
                        <th>Farmer</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="rounded me-3"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                              <div>
                                <div className="fw-bold">{product.name}</div>
                                <small className="text-muted">{product.unit}</small>
                                {product.organic && <Badge bg="success" className="ms-2">Organic</Badge>}
                                {product.featured && <Badge bg="warning" className="ms-1">Featured</Badge>}
                              </div>
                            </div>
                          </td>
                          <td>{product.category}</td>
                          <td className="fw-bold">₦{product.price.toLocaleString()}</td>
                          <td>
                            <div>
                              <span className="fw-bold">{product.stock}</span>
                              <div className="mt-1">{getStockBadge(product.stock)}</div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div>{product.farmer}</div>
                              <small className="text-muted">{product.location}</small>
                            </div>
                          </td>
                          <td>{getStatusBadge(product.status)}</td>
                          <td>
                            <div className="btn-group">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                variant={product.status === 'active' ? 'outline-warning' : 'outline-success'}
                                size="sm"
                                onClick={() => handleToggleStatus(product.id)}
                              >
                                <i className={`fas fa-${product.status === 'active' ? 'pause' : 'play'}`}></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* Add/Edit Product Modal */}
            <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                placeholder="Enter product description"
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₦)</Form.Label>
                  <Form.Control
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Farmer/Supplier</Form.Label>
                  <Form.Control
                    type="text"
                    value={productForm.farmer}
                    onChange={(e) => setProductForm({...productForm, farmer: e.target.value})}
                    placeholder="Enter farmer name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={productForm.location}
                    onChange={(e) => setProductForm({...productForm, location: e.target.value})}
                    placeholder="Enter location"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                value={productForm.image}
                onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                placeholder="Enter image URL"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  label="Organic Product"
                  checked={productForm.organic}
                  onChange={(e) => setProductForm({...productForm, organic: e.target.checked})}
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  label="Featured Product"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSaveProduct}>
            {editingProduct ? 'Update Product' : 'Add Product'}
          </Button>
        </Modal.Footer>
      </Modal>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminProducts;
