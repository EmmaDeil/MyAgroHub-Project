import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Badge,
  Button,
  Modal,
  Form,
  Alert,
  Table,
  Dropdown,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { adminAPI, farmersAPI } from "../services/api";
import AdminNavbar from "./AdminNavbar";

const AdminOrders = ({ user, onLogout, onNavigate }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [farmers, setFarmers] = useState([]);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "Vegetables",
    emoji: "🥬",
    farmerId: "",
    basePrice: "",
    unit: "kg",
    available: "",
    organic: false,
    grade: "Grade A",
    harvestDate: "",
  });

  // Sample orders data
  const sampleOrders = [
    {
      id: "ORD-001",
      customerName: "Adebayo Johnson",
      customerPhone: "+234-801-234-5678",
      customerEmail: "adebayo@email.com",
      productName: "Fresh Tomatoes",
      quantity: 25,
      unit: "kg",
      pricePerUnit: 400,
      total: 10000,
      status: "Pending",
      orderDate: "2024-01-26",
      deliveryAddress: "123 Lagos Street, Lagos",
      farmer: "Adebayo Farms",
      farmerPhone: "+234-814-567-890",
    },
    {
      id: "ORD-002",
      customerName: "Fatima Usman",
      customerPhone: "+234-802-345-6789",
      customerEmail: "fatima@email.com",
      productName: "White Rice",
      quantity: 50,
      unit: "kg",
      pricePerUnit: 800,
      total: 40000,
      status: "Processing",
      orderDate: "2024-01-25",
      deliveryAddress: "456 Abuja Road, Abuja",
      farmer: "Plateau Rice Mills",
      farmerPhone: "+234-815-678-901",
    },
    {
      id: "ORD-003",
      customerName: "Ibrahim Kano",
      customerPhone: "+234-803-456-7890",
      customerEmail: "ibrahim@email.com",
      productName: "Yellow Maize",
      quantity: 100,
      unit: "kg",
      pricePerUnit: 350,
      total: 35000,
      status: "Shipped",
      orderDate: "2024-01-24",
      deliveryAddress: "789 Kano Street, Kano",
      farmer: "Kano Agric Co-op",
      farmerPhone: "+234-816-789-012",
    },
    {
      id: "ORD-004",
      customerName: "Grace Okafor",
      customerPhone: "+234-804-567-8901",
      customerEmail: "grace@email.com",
      productName: "Sweet Potatoes",
      quantity: 30,
      unit: "kg",
      pricePerUnit: 300,
      total: 9000,
      status: "Delivered",
      orderDate: "2024-01-23",
      deliveryAddress: "321 Enugu Avenue, Enugu",
      farmer: "Jos Highland Farms",
      farmerPhone: "+234-817-890-123",
    },
    {
      id: "ORD-005",
      customerName: "Mohammed Aliyu",
      customerPhone: "+234-805-678-9012",
      customerEmail: "mohammed@email.com",
      productName: "Fresh Pepper",
      quantity: 10,
      unit: "kg",
      pricePerUnit: 600,
      total: 6000,
      status: "Cancelled",
      orderDate: "2024-01-22",
      deliveryAddress: "654 Kaduna Street, Kaduna",
      farmer: "Ogun Spice Gardens",
      farmerPhone: "+234-818-901-234",
    },
  ];

  useEffect(() => {
    loadOrders();
    loadFarmers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFiltersAndSorting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, filterStatus, searchTerm, sortBy, sortOrder]);

  const loadOrders = async () => {
    try {
      const response = await adminAPI.getOrders();
      setOrders(response.data || sampleOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders(sampleOrders);
    }
  };

  const loadFarmers = async () => {
    try {
      const response = await farmersAPI.getFarmers();
      setFarmers(response.data || []);
    } catch (error) {
      console.error("Error loading farmers:", error);
      setFarmers([]);
    }
  };

  const handleProductFormChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      category: "Vegetables",
      emoji: "🥬",
      farmerId: "",
      basePrice: "",
      unit: "kg",
      available: "",
      organic: false,
      grade: "Grade A",
      harvestDate: "",
    });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setIsCreatingProduct(true);

    try {
      // Validate required fields
      if (
        !productForm.name ||
        !productForm.farmerId ||
        !productForm.basePrice ||
        !productForm.available
      ) {
        showAlert("Please fill in all required fields", "danger");
        setIsCreatingProduct(false);
        return;
      }

      // Prepare product data
      const productData = {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        emoji: productForm.emoji,
        farmer: productForm.farmerId,
        pricing: {
          basePrice: parseFloat(productForm.basePrice),
          unit: productForm.unit,
        },
        inventory: {
          available: parseInt(productForm.available),
          unit: productForm.unit,
          harvestDate: productForm.harvestDate || new Date().toISOString(),
        },
        quality: {
          organic: productForm.organic,
          grade: productForm.grade,
        },
      };

      const response = await adminAPI.createProduct(productData);

      if (response.success) {
        showAlert("Product created successfully!", "success");
        resetProductForm();
        setShowProductModal(false);
      } else {
        showAlert(response.message || "Failed to create product", "danger");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      showAlert(
        error.response?.data?.message || "Error creating product",
        "danger"
      );
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const applyFiltersAndSorting = () => {
    let filtered = [...orders];

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (order) => order.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.farmer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.orderDate);
          bValue = new Date(b.orderDate);
          break;
        case "total":
          aValue = a.total;
          bValue = b.total;
          break;
        case "customer":
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }

    showAlert(`Order ${orderId} status updated to ${newStatus}`, "success");
  };

  const getStatusBadge = (status) => {
    const variants = {
      Pending: "warning",
      Processing: "info",
      Shipped: "primary",
      Delivered: "success",
      Cancelled: "danger",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: "⏳",
      Processing: "🔄",
      Shipped: "🚚",
      Delivered: "✅",
      Cancelled: "❌",
    };
    return icons[status] || "📦";
  };

  const showAlert = (message, variant = "success") => {
    setAlert({ show: true, message, variant });
    setTimeout(
      () => setAlert({ show: false, message: "", variant: "success" }),
      5000
    );
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "Pending").length,
      processing: orders.filter((o) => o.status === "Processing").length,
      shipped: orders.filter((o) => o.status === "Shipped").length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
      cancelled: orders.filter((o) => o.status === "Cancelled").length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
    };
  };

  const stats = getOrderStats();

  return (
    <div>
      {/* Admin Navigation Bar */}
      <AdminNavbar user={user} onLogout={onLogout} onNavigate={onNavigate} />

      {/* Main Orders Management Content */}
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="text-success mb-1">📦 Order Management</h2>
            <p className="text-muted mb-0">
              Manage and track all customer orders
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="success" onClick={() => setShowProductModal(true)}>
              + Add Product
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => onNavigate("admin")}
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>

        {alert.show && (
          <Alert variant={alert.variant} className="mb-4">
            {alert.message}
          </Alert>
        )}

        {/* Order Statistics */}
        <Row className="mb-4">
          <Col md={2}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body>
                <div style={{ fontSize: "2rem" }}>📦</div>
                <h4 className="text-primary">{stats.total}</h4>
                <small className="text-muted">Total Orders</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body>
                <div style={{ fontSize: "2rem" }}>⏳</div>
                <h4 className="text-warning">{stats.pending}</h4>
                <small className="text-muted">Pending</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body>
                <div style={{ fontSize: "2rem" }}>🔄</div>
                <h4 className="text-info">{stats.processing}</h4>
                <small className="text-muted">Processing</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body>
                <div style={{ fontSize: "2rem" }}>🚚</div>
                <h4 className="text-primary">{stats.shipped}</h4>
                <small className="text-muted">Shipped</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body>
                <div style={{ fontSize: "2rem" }}>✅</div>
                <h4 className="text-success">{stats.delivered}</h4>
                <small className="text-muted">Delivered</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body>
                <div style={{ fontSize: "2rem" }}>💰</div>
                <h4 className="text-success">
                  ₦{stats.totalRevenue.toLocaleString()}
                </h4>
                <small className="text-muted">Total Revenue</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters and Search */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>🔍</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search orders, customers, or products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="total">Sort by Total</option>
                  <option value="customer">Sort by Customer</option>
                  <option value="status">Sort by Status</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button
                  variant={sortOrder === "asc" ? "outline-primary" : "primary"}
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
                </Button>
              </Col>
              <Col md={2}>
                <Button variant="outline-success" onClick={loadOrders}>
                  <i className="fas fa-sync me-1"></i>Refresh
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Orders Table */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">All Orders ({filteredOrders.length})</h5>
          </Card.Header>
          <Card.Body className="p-0">
            {filteredOrders.length > 0 ? (
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Farmer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-bold">#{order.id}</td>
                      <td>
                        <div>{order.customerName}</div>
                        <small className="text-muted">
                          {order.customerPhone}
                        </small>
                      </td>
                      <td>
                        <div>{order.productName}</div>
                        <small className="text-muted">
                          {order.quantity} {order.unit}
                        </small>
                      </td>
                      <td>
                        <div>{order.farmer}</div>
                        <small className="text-muted">
                          {order.farmerPhone}
                        </small>
                      </td>
                      <td className="fw-bold">
                        ₦{order.total?.toLocaleString()}
                      </td>
                      <td>
                        <span className="me-1">
                          {getStatusIcon(order.status)}
                        </span>
                        {getStatusBadge(order.status)}
                      </td>
                      <td>{new Date(order.orderDate).toLocaleDateString()}</td>
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
                <div style={{ fontSize: "4rem" }}>📦</div>
                <h4 className="text-muted">No orders found</h4>
                <p className="text-muted">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your filters or search terms"
                    : "Orders will appear here when customers place them"}
                </p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Order Management Modal */}
        <Modal
          show={showOrderModal}
          onHide={() => setShowOrderModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Manage Order #{selectedOrder?.id}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <div>
                <Row>
                  <Col md={6}>
                    <h6>Customer Information</h6>
                    <p>
                      <strong>Name:</strong> {selectedOrder.customerName}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedOrder.customerPhone}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.customerEmail}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedOrder.deliveryAddress}
                    </p>
                  </Col>
                  <Col md={6}>
                    <h6>Order Details</h6>
                    <p>
                      <strong>Product:</strong> {selectedOrder.productName}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {selectedOrder.quantity}{" "}
                      {selectedOrder.unit}
                    </p>
                    <p>
                      <strong>Price per unit:</strong> ₦
                      {selectedOrder.pricePerUnit?.toLocaleString()}
                    </p>
                    <p>
                      <strong>Total:</strong> ₦
                      {selectedOrder.total?.toLocaleString()}
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {new Date(selectedOrder.orderDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Current Status:</strong>{" "}
                      {getStatusBadge(selectedOrder.status)}
                    </p>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <h6>Farmer Information</h6>
                    <p>
                      <strong>Farmer:</strong> {selectedOrder.farmer}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedOrder.farmerPhone}
                    </p>
                  </Col>
                </Row>

                <hr />

                <h6>Update Status</h6>
                <div className="d-flex gap-2 flex-wrap">
                  {[
                    "Pending",
                    "Processing",
                    "Shipped",
                    "Delivered",
                    "Cancelled",
                  ].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={
                        selectedOrder.status === status
                          ? "success"
                          : "outline-secondary"
                      }
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, status)
                      }
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

        {/* Product Creation Modal */}
        <Modal
          show={showProductModal}
          onHide={() => {
            setShowProductModal(false);
            resetProductForm();
          }}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>🌾 Add New Product</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateProduct}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Product Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Fresh Tomatoes"
                      value={productForm.name}
                      onChange={(e) =>
                        handleProductFormChange("name", e.target.value)
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Category <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={productForm.category}
                      onChange={(e) =>
                        handleProductFormChange("category", e.target.value)
                      }
                      required
                    >
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Grains">Grains</option>
                      <option value="Tubers">Tubers</option>
                      <option value="Legumes">Legumes</option>
                      <option value="Spices">Spices</option>
                      <option value="Herbs">Herbs</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Poultry">Poultry</option>
                      <option value="Livestock">Livestock</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Describe the product..."
                  value={productForm.description}
                  onChange={(e) =>
                    handleProductFormChange("description", e.target.value)
                  }
                />
              </Form.Group>

              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Emoji</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="🥬"
                      value={productForm.emoji}
                      onChange={(e) =>
                        handleProductFormChange("emoji", e.target.value)
                      }
                      maxLength={2}
                    />
                  </Form.Group>
                </Col>
                <Col md={9}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Farmer <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={productForm.farmerId}
                      onChange={(e) =>
                        handleProductFormChange("farmerId", e.target.value)
                      }
                      required
                    >
                      <option value="">Select Farmer</option>
                      {farmers.map((farmer) => (
                        <option key={farmer._id} value={farmer._id}>
                          {farmer.farmName} - {farmer.location?.city},{" "}
                          {farmer.location?.state}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Base Price (₦) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      value={productForm.basePrice}
                      onChange={(e) =>
                        handleProductFormChange("basePrice", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Unit</Form.Label>
                    <Form.Select
                      value={productForm.unit}
                      onChange={(e) =>
                        handleProductFormChange("unit", e.target.value)
                      }
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="lb">Pound (lb)</option>
                      <option value="bag">Bag</option>
                      <option value="basket">Basket</option>
                      <option value="crate">Crate</option>
                      <option value="dozen">Dozen</option>
                      <option value="piece">Piece</option>
                      <option value="bunch">Bunch</option>
                      <option value="liter">Liter</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Available Quantity <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      value={productForm.available}
                      onChange={(e) =>
                        handleProductFormChange("available", e.target.value)
                      }
                      min="0"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Grade</Form.Label>
                    <Form.Select
                      value={productForm.grade}
                      onChange={(e) =>
                        handleProductFormChange("grade", e.target.value)
                      }
                    >
                      <option value="Grade A">Grade A (Premium)</option>
                      <option value="Grade B">Grade B (Good)</option>
                      <option value="Grade C">Grade C (Standard)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Harvest Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={productForm.harvestDate}
                      onChange={(e) =>
                        handleProductFormChange("harvestDate", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="d-block">Organic</Form.Label>
                    <Form.Check
                      type="checkbox"
                      label="This is an organic product"
                      checked={productForm.organic}
                      onChange={(e) =>
                        handleProductFormChange("organic", e.target.checked)
                      }
                      className="mt-2"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowProductModal(false);
                  resetProductForm();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                type="submit"
                disabled={isCreatingProduct}
              >
                {isCreatingProduct ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creating...
                  </>
                ) : (
                  "+ Create Product"
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminOrders;
