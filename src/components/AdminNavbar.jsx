import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown, Container, Badge } from 'react-bootstrap';

const AdminNavbar = ({ user, onLogout, stats = {}, onNavigate }) => {
  const [notifications] = useState([
    { id: 1, type: 'order', message: 'New order received', time: '5 min ago' },
    { id: 2, type: 'farmer', message: 'Farmer registration pending', time: '1 hour ago' }
  ]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleMainSite = () => {
    if (onNavigate) {
      onNavigate('landing');
    } else {
      window.location.href = '/';
    }
  };

  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      window.location.href = `#${page}`;
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm" style={{ minHeight: '70px' }}>
      <Container fluid>
        {/* Admin Brand - Clickable to go to dashboard */}
        <Navbar.Brand 
          href="#" 
          className="fw-bold"
          onClick={() => handleNavigation('admin')}
          style={{ cursor: 'pointer' }}
        >
          <span style={{ fontSize: '1.5rem' }}>🛠️</span>
          <span className="ms-2 text-success">AgroHub Admin</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          {/* Minimal Navigation Links */}
          <Nav className="me-auto">            
            <Nav.Link 
              href="#" 
              className="fw-medium text-warning"
              onClick={handleMainSite}
              title="Go to Main Site"
            >
              🏠 <span className="d-none d-lg-inline">Home</span>
            </Nav.Link>
            
            <Nav.Link 
              href="#" 
              className="fw-medium text-info"
              onClick={() => handleNavigation('home')}
              title="Go to Farm Store"
            >
              🏪 <span className="d-none d-lg-inline">Store</span>
            </Nav.Link>
            
            <Nav.Link 
              href="#" 
              className="fw-medium position-relative"
              onClick={() => handleNavigation('admin-orders')}
            >
              Orders 📦
              {stats.pendingOrders > 0 && (
                <Badge 
                  bg="warning" 
                  pill 
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.6rem' }}
                >
                  {stats.pendingOrders}
                </Badge>
              )}
            </Nav.Link>

            <Nav.Link 
              href="#" 
              className="fw-medium"
              onClick={() => handleNavigation('admin-reports')}
            >
              Reports 📈
            </Nav.Link>
          </Nav>

          {/* Right Side - Notifications & Profile */}
          <Nav className="align-items-center">
            {/* Notifications */}
            <NavDropdown
              title={
                <span className="position-relative">
                  🔔
                  {notifications.length > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.6rem' }}
                    >
                      {notifications.length}
                    </Badge>
                  )}
                </span>
              }
              id="notifications-dropdown"
              align="end"
              className="me-2"
            >
              <NavDropdown.Header>Recent Notifications</NavDropdown.Header>
              {notifications.map(notification => (
                <NavDropdown.Item key={notification.id} className="small">
                  <div className="d-flex justify-content-between">
                    <span>{notification.message}</span>
                    <small className="text-muted">{notification.time}</small>
                  </div>
                </NavDropdown.Item>
              ))}
              <NavDropdown.Divider />
              <NavDropdown.Item href="#all-notifications" className="text-center">
                View All Notifications
              </NavDropdown.Item>
            </NavDropdown>

            {/* Admin Profile Dropdown - No caret */}
            <NavDropdown
              title={
                <span className="d-flex align-items-center">
                  <div 
                    className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-2"
                    style={{ width: '32px', height: '32px', fontSize: '14px' }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="d-none d-md-inline text-white">
                    {user?.name || 'Admin'}
                  </span>
                </span>
              }
              id="admin-profile-dropdown"
              align="end"
              className="no-caret"
            >
              <NavDropdown.Header>
                <div className="text-center py-2">
                  <div 
                    className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-2"
                    style={{ width: '48px', height: '48px', fontSize: '20px' }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <strong>{user?.name || 'Admin User'}</strong>
                  <br />
                  <small className="text-muted">{user?.email || 'admin@agrohub.com'}</small>
                  <br />
                  <Badge bg="success" className="mt-1">Administrator</Badge>
                </div>
              </NavDropdown.Header>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={() => handleNavigation('admin-profile')}>
                <i className="fas fa-user me-2"></i>
                Profile Settings
              </NavDropdown.Item>
              <NavDropdown.Item href="#security-settings">
                <i className="fas fa-lock me-2"></i>
                Security & Privacy
              </NavDropdown.Item>
              <NavDropdown.Item href="#system-preferences">
                <i className="fas fa-cog me-2"></i>
                Preferences
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#help-support">
                <i className="fas fa-question-circle me-2"></i>
                Help & Support
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item 
                onClick={handleLogout}
                className="text-danger"
              >
                <i className="fas fa-sign-out-alt me-2"></i>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
