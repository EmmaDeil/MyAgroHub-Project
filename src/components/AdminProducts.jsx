import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Alert,
  Table,
  Badge,
  Spinner,
} from "react-bootstrap";
import { adminAPI } from "../services/api";
import AdminNavbar from "./AdminNavbar";

const AdminProducts = ({ user, onLogout, onNavigate }) => {
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    unit: "kg",
    stock: "",
    farmer: "",
    emoji: "&#x1F331;",
    organic: false,
    featured: false,
    grade: "A",
  });

  const categories = [
    "Vegetables",
    "Fruits",
    "Grains",
    "Legumes",
    "Tubers",
    "Spices",
    "Livestock",
    "Poultry",
    "Dairy",
    "Other",
  ];
  const units = ["kg", "g", "pieces", "bunches", "liters", "bags", "crates"];

  useEffect(() => {
    loadProducts();
    loadFarmers();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      setAlert({
        show: true,
        message: "Failed to load products from database",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFarmers = async () => {
    try {
      const response = await adminAPI.getFarmers();
      setFarmers(response.data || []);
    } catch (error) {
      console.error("Failed to load farmers:", error);
    }
  };

  const showAlert = (message, variant) => {
    setAlert({ show: true, message, variant });
    setTimeout(
      () => setAlert({ show: false, message: "", variant: "success" }),
      5000
    );
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      unit: "kg",
      stock: "",
      farmer: "",
      emoji: "&#x1F331;",
      organic: false,
      featured: false,
      grade: "A",
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.pricing?.basePrice?.toString() || "",
      category: product.category,
      unit: product.pricing?.unit || "kg",
      stock: product.inventory?.available?.toString() || "",
      farmer: product.farmer?._id || "",
      emoji: product.emoji || "&#x1F331;",
      organic: product.quality?.organic || false,
      featured: product.isFeatured || false,
      grade: product.quality?.grade || "A",
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (
        !productForm.name ||
        !productForm.description ||
        !productForm.category ||
        !productForm.price ||
        !productForm.farmer ||
        !productForm.stock
      ) {
        showAlert("Please fill in all required fields", "warning");
        return;
      }
      const productData = {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        farmer: productForm.farmer,
        price: parseFloat(productForm.price),
        unit: productForm.unit,
        stock: parseInt(productForm.stock),
        emoji: productForm.emoji,
        organic: productForm.organic,
        grade: productForm.grade,
        isFeatured: productForm.featured,
      };
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, productData);
        showAlert("Product updated successfully!", "success");
      } else {
        await adminAPI.createProduct(productData);
        showAlert("Product added successfully!", "success");
      }
      setShowProductModal(false);
      loadProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
      showAlert(
        error.response?.data?.message || "Failed to save product",
        "danger"
      );
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await adminAPI.deleteProduct(productId);
        showAlert(
          response.data.deactivated
            ? "Product deactivated successfully"
            : "Product deleted successfully!",
          response.data.deactivated ? "info" : "success"
        );
        loadProducts();
      } catch (error) {
        showAlert("Failed to delete product", "danger");
        console.error("Delete product error:", error);
      }
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await adminAPI.updateProduct(product._id, {
        isActive: !product.isActive,
      });
      const status = !product.isActive ? "activated" : "deactivated";
      showAlert(`Product ${status} successfully!`, "success");
      loadProducts();
    } catch (error) {
      showAlert("Failed to update product status", "danger");
      console.error("Toggle status error:", error);
    }
  };

  const getStatusBadge = (isActive) =>
    isActive ? (
      <Badge bg="success">Active</Badge>
    ) : (
      <Badge bg="secondary">Inactive</Badge>
    );
  const getStockBadge = (stock) =>
    stock === 0 ? (
      <Badge bg="danger">Out of Stock</Badge>
    ) : stock < 10 ? (
      <Badge bg="warning">Low Stock</Badge>
    ) : (
      <Badge bg="success">In Stock</Badge>
    );

  const displayProducts = products.map((p) => {
    const locationStr =
      p.farmer?.location?.city && p.farmer?.location?.state
        ? `${p.farmer.location.city}, ${p.farmer.location.state}`
        : "N/A";
    return {
      _id: p._id,
      name: p.name,
      category: p.category,
      price: p.pricing?.basePrice || 0,
      unit: p.pricing?.unit || "kg",
      stock: p.inventory?.available || 0,
      farmer: p.farmer?.farmName || "Unknown",
      location: locationStr,
      image: p.emoji || "🌱",
      organic: p.quality?.organic || false,
      featured: p.isFeatured || false,
      isActive: p.isActive,
    };
  });

  if (loading)
    return (
      <div>
        <AdminNavbar user={user} onLogout={onLogout} onNavigate={onNavigate} />
        <div
          className="container-fluid d-flex justify-content-center align-items-center"
          style={{ minHeight: "80vh" }}
        >
          <div className="text-center">
            <Spinner
              animation="border"
              variant="success"
              style={{ width: "3rem", height: "3rem" }}
            />
            <p className="mt-3 text-muted">Loading products...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div>
      <AdminNavbar user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <div className="container-fluid px-0 min-vh-100">
        <div className="row g-0 min-vh-100">
          <div className="col-12 px-4 py-5 bg-light">
            <div className="d-flex justify-content-between align-items-center mb-5">
              <div>
                <h1 className="display-4 text-success mb-2">
                  Product Management
                </h1>
                <p className="lead text-muted">Database Connected</p>
              </div>
              <Button variant="success" size="lg" onClick={handleAddProduct}>
                Add New Product
              </Button>
            </div>
            {alert.show && (
              <Alert
                variant={alert.variant}
                dismissible
                onClose={() => setAlert({ show: false })}
              >
                {alert.message}
              </Alert>
            )}
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Products ({displayProducts.length})</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {displayProducts.length === 0 ? (
                  <div className="text-center py-5">
                    <p>No products found</p>
                    <Button variant="success" onClick={handleAddProduct}>
                      Add Product
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <thead className="bg-light">
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Farmer</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayProducts.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <div className="fw-bold">{p.name}</div>
                          </td>
                          <td>{p.category}</td>
                          <td>
                            ₦{p.price}/{p.unit}
                          </td>
                          <td>
                            {p.stock} {p.unit}
                            <div>{getStockBadge(p.stock)}</div>
                          </td>
                          <td>{p.farmer}</td>
                          <td>{getStatusBadge(p.isActive)}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="me-2"
                              onClick={() =>
                                handleEditProduct(
                                  products.find((pr) => pr._id === p._id)
                                )
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                p.isActive
                                  ? "outline-warning"
                                  : "outline-success"
                              }
                              className="me-2"
                              onClick={() =>
                                handleToggleStatus(
                                  products.find((pr) => pr._id === p._id)
                                )
                              }
                            >
                              {p.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteProduct(p._id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
            <Modal
              show={showProductModal}
              onHide={() => setShowProductModal(false)}
              size="lg"
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  {editingProduct ? "Edit Product" : "Add Product"}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          value={productForm.category}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              category: e.target.value,
                            })
                          }
                        >
                          <option value="">Select</option>
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Farmer</Form.Label>
                        <Form.Select
                          value={productForm.farmer}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              farmer: e.target.value,
                            })
                          }
                        >
                          <option value="">Select</option>
                          {farmers.map((f) => (
                            <option key={f._id} value={f._id}>
                              {f.farmName}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                          type="number"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              price: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Unit</Form.Label>
                        <Form.Select
                          value={productForm.unit}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              unit: e.target.value,
                            })
                          }
                        >
                          {units.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Stock</Form.Label>
                        <Form.Control
                          type="number"
                          value={productForm.stock}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              stock: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="success" onClick={handleSaveProduct}>
                  {editingProduct ? "Update" : "Add"} Product
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
