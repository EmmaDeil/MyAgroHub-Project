import React from 'react';
import { Dropdown, Badge, Navbar, Nav, Container } from 'react-bootstrap';

const NavigationHeader = ({ currentPage, setCurrentPage, getTotalItems, getTotalPrice, user, onShowAuth, onLogout }) => {
  // Check if user is admin
  const isAdmin = () => {
    return user && (user.email === 'admin@agrohub.com' || user.role === 'admin');
  };

  // Enhanced styling for better user experience
  const navLinkStyle = {
    transition: 'all 0.3s ease',
    borderRadius: '8px',
    margin: '0 4px',
    padding: '8px 16px',
  };

  const activeNavStyle = {
    ...navLinkStyle,
    fontWeight: 'bold',
    color: '#ffffff !important',
  };

  return (
    <div style={{ position: 'relative', zIndex: 1030 }}>
      <Navbar expand="lg" className="navbar-dark shadow-sm mb-4" style={{ 
        backgroundColor: '#28a745',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        zIndex: 1030
      }}>
      <Container fluid>
        {/* Enhanced Brand */}
        <Navbar.Brand 
          className="d-flex align-items-center fw-bold" 
          style={{ 
            fontSize: '1.8rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            cursor: 'pointer'
          }}
          onClick={() => setCurrentPage('landing')}
        >
          <span className="me-2" style={{ fontSize: '2rem' }}>🌾</span>
          <span className="d-none d-md-inline">AgroHub Farm Store</span>
          <span className="d-md-none">AgroHub</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbarNav" className="border-0" />
        
        <Navbar.Collapse id="navbarNav">
          <Nav className="me-auto">
            {/* Show full navigation only for guests or admin users */}
            {!user && (
              <>
                {/* Home */}
                <Nav.Item>
                  <button 
                    className={`nav-link btn btn-link text-white border-0 ${currentPage === 'landing' ? 'fw-bold' : ''}`}
                    onClick={() => setCurrentPage('landing')}
                    style={currentPage === 'landing' ? activeNavStyle : navLinkStyle}
                  >
                    <i className="fas fa-home me-1"></i>
                    <span className="d-none d-lg-inline">Home</span>
                  </button>
                </Nav.Item>

                {/* Products */}
                <Nav.Item>
                  <button 
                    className={`nav-link btn btn-link text-white border-0 ${currentPage === 'home' ? 'fw-bold' : ''}`}
                    onClick={() => setCurrentPage('home')}
                    style={currentPage === 'home' ? activeNavStyle : navLinkStyle}
                  >
                    <i className="fas fa-leaf me-1"></i>
                    <span className="d-none d-lg-inline">Products</span>
                  </button>
                </Nav.Item>
                
                {/* About */}
                <Nav.Item>
                  <button 
                    className={`nav-link btn btn-link text-white border-0 ${currentPage === 'about' ? 'fw-bold' : ''}`}
                    onClick={() => setCurrentPage('about')}
                    style={currentPage === 'about' ? activeNavStyle : navLinkStyle}
                  >
                    <i className="fas fa-info-circle me-1"></i>
                    <span className="d-none d-lg-inline">About</span>
                  </button>
                </Nav.Item>

                {/* Contact */}
                <Nav.Item>
                  <button 
                    className={`nav-link btn btn-link text-white border-0 ${currentPage === 'contact' ? 'fw-bold' : ''}`}
                    onClick={() => setCurrentPage('contact')}
                    style={currentPage === 'contact' ? activeNavStyle : navLinkStyle}
                  >
                    <i className="fas fa-phone me-1"></i>
                    <span className="d-none d-lg-inline">Contact</span>
                  </button>
                </Nav.Item>
              </>
            )}
            
            {/* User-specific Navigation Items - Only show cart and orders for regular users */}
            {user && !isAdmin() && (
              <>
                {/* Enhanced Cart with badge */}
                <Nav.Item>
                  <button 
                    className={`nav-link btn btn-link text-white border-0 position-relative ${currentPage === 'cart' ? 'fw-bold' : ''}`}
                    onClick={() => setCurrentPage('cart')}
                    style={currentPage === 'cart' ? activeNavStyle : navLinkStyle}
                  >
                    <i className="fas fa-shopping-cart me-1"></i>
                    <span className="d-none d-lg-inline">Cart</span>
                    {getTotalItems() > 0 && (
                      <Badge 
                        bg="warning" 
                        text="dark"
                        className="position-absolute top-0 start-100 translate-middle rounded-pill"
                        style={{ fontSize: '0.7rem', minWidth: '20px' }}
                      >
                        {getTotalItems()}
                      </Badge>
                    )}
                  </button>
                </Nav.Item>

                {/* My Orders with enhanced styling */}
                <Nav.Item>
                  <button 
                    className={`nav-link btn btn-link text-white border-0 position-relative ${currentPage === 'orders' ? 'fw-bold' : ''}`}
                    onClick={() => setCurrentPage('orders')}
                    style={currentPage === 'orders' ? activeNavStyle : navLinkStyle}
                  >
                    <i className="fas fa-box me-1"></i>
                    <span className="d-none d-lg-inline">My Orders</span>
                  </button>
                </Nav.Item>
              </>
            )}
            
            {/* Admin-specific Navigation Items */}
            {user && isAdmin() && (
              <>
                {/* Home */}
                <Nav.Item>
                  <button 
                    className={`nav-link btn btn-link text-white border-0 ${currentPage === 'landing' ? 'fw-bold' : ''}`}
                    onClick={() => setCurrentPage('landing')}
                    style={currentPage === 'landing' ? activeNavStyle : navLinkStyle}
                  >
                    <i className="fas fa-home me-1"></i>
                    <span className="d-none d-lg-inline">Home</span>
                  </button>
                </Nav.Item>

                {/* Products */}
                <Nav.Item>
                  <button 
                    className={`nav-link btn btn-link text-white border-0 ${currentPage === 'home' ? 'fw-bold' : ''}`}
                    onClick={() => setCurrentPage('home')}
                    style={currentPage === 'home' ? activeNavStyle : navLinkStyle}
                  >
                    <i className="fas fa-leaf me-1"></i>
                    <span className="d-none d-lg-inline">Products</span>
                  </button>
                </Nav.Item>

                {/* Admin Dashboard - Enhanced visibility */}
                <Nav.Item>
                  <button 
                    className={`nav-link btn btn-link border-0 ${currentPage === 'admin' ? 'fw-bold' : ''}`}
                    onClick={() => setCurrentPage('admin')}
                    style={{
                      ...navLinkStyle,
                      color: '#ffc107',
                      backgroundColor: currentPage === 'admin' ? 'rgba(255, 193, 7, 0.2)' : 'transparent'
                    }}
                  >
                    <i className="fas fa-cog me-1"></i>
                    <span className="d-none d-lg-inline">Admin Panel</span>
                  </button>
                </Nav.Item>
              </>
            )}
          </Nav>
          
          {/* Right Side Navigation */}
          <div className="d-flex align-items-center">
            {user ? (
              <>
                {/* Enhanced Cart Summary for logged in users */}
                {/* <div className="me-3 d-none d-md-block">
                  <div className="d-flex align-items-center p-2 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <i className="fas fa-shopping-cart text-warning me-2"></i>
                    <div>
                      <small className="text-white-50 d-block">Cart Total</small>
                      <span className="text-warning fw-bold">₦{getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div> */}
                
                {/* Enhanced User Dropdown */}
                <Dropdown align="end" drop="down" autoClose="outside">
                  <Dropdown.Toggle 
                    variant="outline-light" 
                    id="dropdown-user" 
                    className="d-flex align-items-center border-0 shadow-sm"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      padding: '8px 16px',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      zIndex: 1040
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-white bg-opacity-25 p-1 me-2" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt="Profile" 
                            className="rounded-circle"
                            style={{ 
                              width: '28px', 
                              height: '28px', 
                              objectFit: 'cover' 
                            }}
                          />
                        ) : (
                          <i className="fas fa-user text-white"></i>
                        )}
                      </div>
                      <div className="d-none d-md-block text-start">
                        <div className="fw-bold text-white" style={{ fontSize: '0.9rem' }}>
                          {user.name || user.firstName || 'User'}
                        </div>
                        <small className="text-white-50">
                          {isAdmin() ? 'Admin' : 'Customer'}
                        </small>
                      </div>
                      <i className="fas fa-chevron-down ms-2 text-white-50" style={{ fontSize: '0.7rem' }}></i>
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu 
                    className="shadow-lg border-0" 
                    style={{ 
                      borderRadius: '12px', 
                      minWidth: '280px',
                      zIndex: 9999,
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      left: 'auto',
                      transform: 'none',
                      willChange: 'transform',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: '#ffffff',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      marginTop: '8px'
                    }}
                  >
                    <Dropdown.Header className="bg-light">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {user.profileImage ? (
                            <img 
                              src={user.profileImage} 
                              alt="Profile" 
                              className="rounded-circle"
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                objectFit: 'cover',
                                border: '2px solid #28a745'
                              }}
                            />
                          ) : (
                            <div className="rounded-circle bg-success d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                              <i className="fas fa-user text-white"></i>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{user.name || user.firstName || 'User'}</div>
                          <small className="text-muted">{user.email}</small>
                          {isAdmin() && <Badge bg="warning" text="dark" className="mt-1">Admin</Badge>}
                        </div>
                      </div>
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    
                    {/* User Dashboard */}
                    {!isAdmin() && (
                      <Dropdown.Item 
                        onClick={() => setCurrentPage('dashboard')}
                        className="d-flex align-items-center py-2"
                      >
                        <i className="fas fa-tachometer-alt me-3 text-primary"></i>
                        <div>
                          <div className="fw-semibold">My Dashboard</div>
                          <small className="text-muted">View your account overview</small>
                        </div>
                      </Dropdown.Item>
                    )}

                    {/* Settings */}
                    <Dropdown.Item 
                      onClick={() => setCurrentPage('settings')}
                      className="d-flex align-items-center py-2"
                    >
                      <i className="fas fa-cog me-3 text-secondary"></i>
                      <div>
                        <div className="fw-semibold">Settings</div>
                        <small className="text-muted">Manage your profile and preferences</small>
                      </div>
                    </Dropdown.Item>
                    
                    {/* My Orders */}
                    <Dropdown.Item 
                      onClick={() => setCurrentPage('orders')}
                      className="d-flex align-items-center py-2"
                    >
                      <i className="fas fa-box me-3 text-info"></i>
                      <div>
                        <div className="fw-semibold">My Orders</div>
                        <small className="text-muted">Track your purchases</small>
                      </div>
                    </Dropdown.Item>
                    
                    {/* Shopping Cart */}
                    <Dropdown.Item 
                      onClick={() => setCurrentPage('cart')}
                      className="d-flex align-items-center py-2"
                    >
                      <i className="fas fa-shopping-cart me-3 text-success"></i>
                      <div className="flex-grow-1">
                        <div className="fw-semibold d-flex justify-content-between">
                          <span>Shopping Cart</span>
                          {getTotalItems() > 0 && (
                            <Badge bg="success" className="rounded-pill">
                              {getTotalItems()}
                            </Badge>
                          )}
                        </div>
                        <small className="text-muted">
                          {getTotalItems() > 0 ? `₦${getTotalPrice().toLocaleString()}` : 'Empty cart'}
                        </small>
                      </div>
                    </Dropdown.Item>
                    
                    {/* Admin Panel for admin users */}
                    {isAdmin() && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item 
                          onClick={() => setCurrentPage('admin')} 
                          className="d-flex align-items-center py-2"
                          style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}
                        >
                          <i className="fas fa-cog me-3 text-warning"></i>
                          <div>
                            <div className="fw-semibold text-warning">Admin Panel</div>
                            <small className="text-muted">Manage the platform</small>
                          </div>
                        </Dropdown.Item>
                      </>
                    )}
                    
                    <Dropdown.Divider />
                    
                    {/* Logout */}
                    <Dropdown.Item 
                      onClick={onLogout} 
                      className="d-flex align-items-center py-2 text-danger"
                    >
                      <i className="fas fa-sign-out-alt me-3"></i>
                      <div>
                        <div className="fw-semibold">Logout</div>
                        <small className="text-muted">Sign out of your account</small>
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                {/* Enhanced Guest Welcome */}
                <div className="me-3 d-none d-lg-block">
                  <div className="text-center">
                    <small className="text-white-50 d-block">Welcome to AgroHub!</small>
                    <small className="text-white fw-light">Login to start shopping</small>
                  </div>
                </div>
                
                {/* Enhanced Login/Signup Button */}
                <button 
                  className="btn fw-bold shadow-sm"
                  onClick={onShowAuth}
                  style={{
                    background: 'linear-gradient(45deg, #ffc107, #ffeb3b)',
                    color: '#333',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '10px 20px',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  <i className="fas fa-user me-2"></i>
                  <span className="d-none d-sm-inline">Get Started</span>
                  <span className="d-sm-none">Login</span>
                </button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </div>
  );
};

export default NavigationHeader;
