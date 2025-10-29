import React, { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Badge,
  Offcanvas,
  Button,
} from "react-bootstrap";
import { adminAPI } from "../services/api";

const AdminNavbar = ({ user, onLogout, stats = {}, onNavigate }) => {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getNotifications();
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.route && onNavigate) {
      const routeMap = {
        "/admin-orders": "admin-orders",
        "/admin-users": "admin-users",
        "/admin-products": "admin-products",
      };
      const page = routeMap[notification.route];
      if (page) {
        handleNavigation(page);
      }
    }
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    handleClose();
    if (onLogout) {
      onLogout();
    }
  };

  const handleMainSite = () => {
    handleClose();
    if (onNavigate) {
      onNavigate("landing");
    } else {
      window.location.href = "/";
    }
  };

  const handleNavigation = (page) => {
    handleClose();
    if (onNavigate) {
      onNavigate(page);
    } else {
      window.location.href = `#${page}`;
    }
  };

  return (
    <>
      {/* Modern Green Navbar */}
      <Navbar
        expand="lg"
        className="shadow-sm"
        style={{
          background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
          minHeight: "70px",
          position: "sticky",
          top: 0,
          zIndex: 1030,
        }}
      >
        <Container fluid className="px-3 px-md-4">
          {/* Brand - Always Visible */}
          <Navbar.Brand
            href="#"
            className="fw-bold text-white d-flex align-items-center"
            onClick={() => handleNavigation("admin")}
            style={{ cursor: "pointer", fontSize: "1.4rem" }}
          >
            <span style={{ fontSize: "1.8rem" }} className="me-2">
              {/* 🌾 */}
            </span>
            <span className="d-none d-sm-inline">📊 Dashboard</span>
            <span className="d-sm-none">AgroHub</span>
          </Navbar.Brand>

          {/* Desktop Navigation - Hidden on Mobile */}
          <div className="d-none d-lg-flex align-items-center flex-grow-1 mx-4">
            <Nav className="me-auto">
              <Nav.Link
                href="#"
                className="text-white fw-medium px-3"
                onClick={handleMainSite}
                style={{
                  transition: "all 0.3s",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                🏠 Home
              </Nav.Link>

              {/* <Nav.Link
                href="#"
                className="text-white fw-medium px-3"
                onClick={() => handleNavigation("admin")}
                style={{
                  transition: "all 0.3s",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                
              </Nav.Link> */}

              <Nav.Link
                href="#"
                className="text-white fw-medium px-3 position-relative"
                onClick={() => handleNavigation("admin-orders")}
                style={{
                  transition: "all 0.3s",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                📦 Orders
                {stats.pendingOrders > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="ms-2"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {stats.pendingOrders}
                  </Badge>
                )}
              </Nav.Link>

              <Nav.Link
                href="#"
                className="text-white fw-medium px-3"
                onClick={() => handleNavigation("admin-products")}
                style={{
                  transition: "all 0.3s",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                🏪 Products
              </Nav.Link>

              <Nav.Link
                href="#"
                className="text-white fw-medium px-3"
                onClick={() => handleNavigation("admin-reports")}
                style={{
                  transition: "all 0.3s",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                📈 Reports
              </Nav.Link>

              <Nav.Link
                href="#"
                className="text-white fw-medium px-3"
                onClick={() => handleNavigation("admin-users")}
                style={{
                  transition: "all 0.3s",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                👥 Users
              </Nav.Link>
            </Nav>
          </div>

          {/* Right Side - Notifications & Profile (Desktop) */}
          <div className="d-none d-lg-flex align-items-center">
            {/* Notifications */}
            <NavDropdown
              title={
                <span
                  className="position-relative text-white"
                  style={{ fontSize: "1.3rem" }}
                >
                  🔔
                  {notifications.length > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute"
                      style={{
                        top: "-5px",
                        right: "-5px",
                        fontSize: "0.6rem",
                      }}
                    >
                      {notifications.length}
                    </Badge>
                  )}
                </span>
              }
              id="notifications-dropdown"
              align="end"
              className="me-3"
            >
              <NavDropdown.Header>Recent Notifications</NavDropdown.Header>
              {loading ? (
                <NavDropdown.Item className="text-center small py-2">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Loading...
                </NavDropdown.Item>
              ) : notifications.length === 0 ? (
                <NavDropdown.Item className="text-center small text-muted py-2">
                  No new notifications
                </NavDropdown.Item>
              ) : (
                notifications.map((notification) => (
                  <NavDropdown.Item
                    key={notification.id}
                    className="small py-2"
                    onClick={() => handleNotificationClick(notification)}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <div>
                        {notification.type === "order" && "📦 "}
                        {notification.type === "farmer" && "👨‍🌾 "}
                        {notification.type === "stock" && "⚠️ "}
                        {notification.message}
                      </div>
                      <small className="text-muted">{notification.time}</small>
                    </div>
                  </NavDropdown.Item>
                ))
              )}
              <NavDropdown.Divider />
              <NavDropdown.Item
                className="text-center text-success"
                onClick={loadNotifications}
              >
                🔄 Refresh
              </NavDropdown.Item>
            </NavDropdown>

            {/* Admin Profile Dropdown */}
            <NavDropdown
              title={
                <span className="d-flex align-items-center">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="rounded-circle"
                      style={{
                        width: "38px",
                        height: "38px",
                        objectFit: "cover",
                        border: "2px solid white",
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-white text-success d-flex align-items-center justify-content-center"
                      style={{
                        width: "38px",
                        height: "38px",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                  )}
                  <span className="d-none d-xl-inline text-white ms-2 fw-medium">
                    {user?.name || "Admin"}
                  </span>
                </span>
              }
              id="admin-profile-dropdown"
              align="end"
              drop="down"
            >
              <NavDropdown.Header>
                <div className="text-center py-2" style={{ minWidth: "250px" }}>
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="rounded-circle mx-auto mb-2"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-2"
                      style={{
                        width: "50px",
                        height: "50px",
                        fontSize: "22px",
                        fontWeight: "bold",
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                  )}
                  <strong>{user?.name || "Admin User"}</strong>
                  <br />
                  <small className="text-muted">
                    {user?.email || "admin@example.com"}
                  </small>
                  <br />
                  <Badge bg="success" className="mt-2">
                    Administrator
                  </Badge>
                </div>
              </NavDropdown.Header>
              <NavDropdown.Divider />
              <NavDropdown.Item
                onClick={() => handleNavigation("admin-profile")}
              >
                👤 Profile Settings
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => handleNavigation("admin-users")}>
                👥 User Management
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                🚪 Logout
              </NavDropdown.Item>
            </NavDropdown>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="light"
            className="d-lg-none"
            onClick={handleShow}
            style={{
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          >
            ☰
          </Button>
        </Container>
      </Navbar>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="end"
        style={{
          width: "280px",
        }}
      >
        <Offcanvas.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
          }}
        >
          <Offcanvas.Title className="text-white fw-bold">
            🌾 Admin Menu
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {/* User Profile Section */}
          <div
            className="p-3 text-center"
            style={{
              background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
              color: "white",
            }}
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="rounded-circle mx-auto mb-2"
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  display: "block",
                  border: "2px solid white",
                }}
              />
            ) : (
              <div
                className="rounded-circle bg-white text-success d-flex align-items-center justify-content-center mx-auto mb-2"
                style={{
                  width: "60px",
                  height: "60px",
                  fontSize: "26px",
                  fontWeight: "bold",
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            <strong>{user?.name || "Admin User"}</strong>
            <br />
            <small>{user?.email || "admin@example.com"}</small>
            <br />
            <Badge bg="light" text="success" className="mt-2">
              Administrator
            </Badge>
          </div>

          {/* Navigation Links */}
          <div className="py-2">
            <Nav className="flex-column">
              <Nav.Link
                onClick={handleMainSite}
                className="py-3 px-4 border-bottom d-flex align-items-center"
                style={{ color: "#333", fontSize: "1rem" }}
              >
                <span style={{ fontSize: "1.2rem" }}>🏠</span>
                <span className="ms-3 fw-medium">Home</span>
              </Nav.Link>

              <Nav.Link
                onClick={() => handleNavigation("admin")}
                className="py-3 px-4 border-bottom d-flex align-items-center"
                style={{ color: "#333", fontSize: "1rem" }}
              >
                <span style={{ fontSize: "1.2rem" }}>📊</span>
                <span className="ms-3 fw-medium">Dashboard</span>
              </Nav.Link>

              <Nav.Link
                onClick={() => handleNavigation("admin-orders")}
                className="py-3 px-4 border-bottom d-flex align-items-center justify-content-between"
                style={{ color: "#333", fontSize: "1rem" }}
              >
                <div className="d-flex align-items-center">
                  <span style={{ fontSize: "1.2rem" }}>📦</span>
                  <span className="ms-3 fw-medium">Orders</span>
                </div>
                {stats.pendingOrders > 0 && (
                  <Badge bg="danger" pill>
                    {stats.pendingOrders}
                  </Badge>
                )}
              </Nav.Link>

              <Nav.Link
                onClick={() => handleNavigation("admin-products")}
                className="py-3 px-4 border-bottom d-flex align-items-center"
                style={{ color: "#333", fontSize: "1rem" }}
              >
                <span style={{ fontSize: "1.2rem" }}>🏪</span>
                <span className="ms-3 fw-medium">Products</span>
              </Nav.Link>

              <Nav.Link
                onClick={() => handleNavigation("admin-reports")}
                className="py-3 px-4 border-bottom d-flex align-items-center"
                style={{ color: "#333", fontSize: "1rem" }}
              >
                <span style={{ fontSize: "1.2rem" }}>📈</span>
                <span className="ms-3 fw-medium">Reports</span>
              </Nav.Link>

              <Nav.Link
                onClick={() => handleNavigation("admin-users")}
                className="py-3 px-4 border-bottom d-flex align-items-center"
                style={{ color: "#333", fontSize: "1rem" }}
              >
                <span style={{ fontSize: "1.2rem" }}>👥</span>
                <span className="ms-3 fw-medium">Users</span>
              </Nav.Link>

              <Nav.Link
                onClick={() => handleNavigation("admin-profile")}
                className="py-3 px-4 border-bottom d-flex align-items-center"
                style={{ color: "#333", fontSize: "1rem" }}
              >
                <span style={{ fontSize: "1.2rem" }}>👤</span>
                <span className="ms-3 fw-medium">Profile Settings</span>
              </Nav.Link>
            </Nav>
          </div>

          {/* Notifications Section */}
          <div className="px-4 py-3 bg-light">
            <h6 className="fw-bold mb-3 d-flex align-items-center justify-content-between">
              <span>
                🔔 Notifications
                {notifications.length > 0 && (
                  <Badge bg="danger" pill className="ms-2">
                    {notifications.length}
                  </Badge>
                )}
              </span>
              <Button
                size="sm"
                variant="outline-success"
                onClick={loadNotifications}
                disabled={loading}
              >
                🔄
              </Button>
            </h6>
            {loading ? (
              <div className="text-center py-2">
                <span className="spinner-border spinner-border-sm me-2"></span>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center text-muted py-2 small">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="small mb-2 p-2 bg-white rounded"
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    {notification.type === "order" && "📦 "}
                    {notification.type === "farmer" && "👨‍🌾 "}
                    {notification.type === "stock" && "⚠️ "}
                    {notification.message}
                  </div>
                  <small className="text-muted">{notification.time}</small>
                </div>
              ))
            )}
          </div>

          {/* Logout Button */}
          <div className="p-3">
            <Button
              variant="danger"
              className="w-100"
              onClick={handleLogout}
              style={{
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              🚪 Logout
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AdminNavbar;
