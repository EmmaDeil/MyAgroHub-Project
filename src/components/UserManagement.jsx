import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Badge, Button, Modal, Form, Alert, Table, 
  Pagination, InputGroup, FormControl, Dropdown, ButtonGroup, Toast, ToastContainer 
} from 'react-bootstrap';
import { adminAPI } from '../services/api';

// Custom styles for dropdown overlay
const dropdownStyles = `
  .table-dropdown-overlay .dropdown-menu {
    position: fixed !important;
    z-index: 9999 !important;
    transform: translateY(0) !important;
  }
`;

const UserManagement = ({ onNavigate }) => {
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  
  // Form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    isActive: true,
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      zipCode: ''
    }
  });

  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0,
    farmerUsers: 0,
    regularUsers: 0,
    newUsersThisMonth: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole, selectedStatus]);

  useEffect(() => {
    // Adjust current page if it's higher than total pages after filtering
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredUsers, currentPage, usersPerPage]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Try to load from API first
      const response = await adminAPI.getAllUsers();
      if (response.success) {
        setUsers(response.data);
        calculateStats(response.data);
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to sample data for development
      const sampleUsers = generateSampleUsers();
      setUsers(sampleUsers);
      calculateStats(sampleUsers);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleUsers = () => {
    return [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+234801234567',
        role: 'user',
        isActive: true,
        lastLogin: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        address: { city: 'Lagos', state: 'Lagos State', country: 'Nigeria' }
      },
      {
        _id: '2',
        name: 'Alice Farmer',
        email: 'alice.farmer@email.com',
        phone: '+234802345678',
        role: 'farmer',
        isActive: true,
        lastLogin: new Date('2024-01-14'),
        createdAt: new Date('2024-01-02'),
        address: { city: 'Kano', state: 'Kano State', country: 'Nigeria' }
      },
      {
        _id: '3',
        name: 'Bob Admin',
        email: 'bob.admin@email.com',
        phone: '+234803456789',
        role: 'admin',
        isActive: true,
        lastLogin: new Date('2024-01-16'),
        createdAt: new Date('2023-12-01'),
        address: { city: 'Abuja', state: 'FCT', country: 'Nigeria' }
      },
      {
        _id: '4',
        name: 'Carol User',
        email: 'carol.user@email.com',
        phone: '+234804567890',
        role: 'user',
        isActive: false,
        lastLogin: new Date('2024-01-10'),
        createdAt: new Date('2024-01-03'),
        address: { city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' }
      },
      {
        _id: '5',
        name: 'David Agric',
        email: 'david.agric@email.com',
        phone: '+234805678901',
        role: 'farmer',
        isActive: true,
        lastLogin: new Date('2024-01-13'),
        createdAt: new Date('2024-01-05'),
        address: { city: 'Kaduna', state: 'Kaduna State', country: 'Nigeria' }
      }
    ];
  };

  const calculateStats = (userData) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    setStats({
      totalUsers: userData.length,
      activeUsers: userData.filter(u => u.isActive).length,
      inactiveUsers: userData.filter(u => !u.isActive).length,
      adminUsers: userData.filter(u => u.role === 'admin').length,
      farmerUsers: userData.filter(u => u.role === 'farmer').length,
      regularUsers: userData.filter(u => u.role === 'user').length,
      newUsersThisMonth: userData.filter(u => new Date(u.createdAt) >= thisMonth).length
    });
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      const isActive = selectedStatus === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    setFilteredUsers(filtered);
    // Page adjustment is now handled by useEffect
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 4000);
  };

  const handleUserAction = (user, action) => {
    setSelectedUser(user);
    setModalMode(action);

    if (action === 'view' || action === 'edit') {
      setUserForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        password: '',
        confirmPassword: '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          country: user.address?.country || 'Nigeria',
          zipCode: user.address?.zipCode || ''
        }
      });
      setShowUserModal(true);
    } else if (action === 'delete') {
      setShowDeleteModal(true);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setUserForm({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      isActive: true,
      password: '',
      confirmPassword: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'Nigeria',
        zipCode: ''
      }
    });
    setShowUserModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (modalMode === 'create' && userForm.password !== userForm.confirmPassword) {
      showAlert('Passwords do not match', 'danger');
      return;
    }

    try {
      let response;
      const userData = {
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        role: userForm.role,
        isActive: userForm.isActive,
        address: userForm.address
      };

      if (modalMode === 'create') {
        userData.password = userForm.password;
        response = await adminAPI.createUser(userData);
        showAlert('User created successfully!', 'success');
      } else if (modalMode === 'edit') {
        response = await adminAPI.updateUser(selectedUser._id, userData);
        showAlert('User updated successfully!', 'success');
      }

      setShowUserModal(false);
      loadUsers(); // Reload users
    } catch (error) {
      console.error('Error saving user:', error);
      
      // Fallback for development - update local state
      if (modalMode === 'create') {
        const newUser = {
          _id: Date.now().toString(),
          ...userForm,
          createdAt: new Date(),
          lastLogin: null
        };
        setUsers(prev => [...prev, newUser]);
        showAlert('User created successfully! (Local mode)', 'warning');
      } else if (modalMode === 'edit') {
        setUsers(prev => prev.map(user => 
          user._id === selectedUser._id 
            ? { ...user, ...userForm, updatedAt: new Date() }
            : user
        ));
        showAlert('User updated successfully! (Local mode)', 'warning');
      }
      
      setShowUserModal(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminAPI.deleteUser(selectedUser._id);
      showAlert('User deleted successfully!', 'success');
      setShowDeleteModal(false);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      
      // Fallback for development
      setUsers(prev => prev.filter(user => user._id !== selectedUser._id));
      showAlert('User deleted successfully! (Local mode)', 'warning');
      setShowDeleteModal(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const updatedData = { isActive: !user.isActive };
      await adminAPI.updateUser(user._id, updatedData);
      showAlert(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      
      // Fallback for development
      setUsers(prev => prev.map(u => 
        u._id === user._id 
          ? { ...u, isActive: !u.isActive, updatedAt: new Date() }
          : u
      ));
      showAlert(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully! (Local mode)`, 'warning');
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'danger',
      farmer: 'success',
      user: 'primary'
    };
    return <Badge bg={variants[role]} className="text-capitalize">{role}</Badge>;
  };

  const getStatusBadge = (isActive) => {
    return (
      <Badge bg={isActive ? 'success' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  // Ensure currentPage is valid after filtering
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const validIndexOfLastUser = validCurrentPage * usersPerPage;
  const validIndexOfFirstUser = validIndexOfLastUser - usersPerPage;
  
  const currentUsers = filteredUsers.slice(validIndexOfFirstUser, validIndexOfLastUser);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === validCurrentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.First onClick={() => setCurrentPage(1)} disabled={validCurrentPage === 1} />
        <Pagination.Prev onClick={() => setCurrentPage(validCurrentPage - 1)} disabled={validCurrentPage === 1} />
        {items}
        <Pagination.Next onClick={() => setCurrentPage(validCurrentPage + 1)} disabled={validCurrentPage === totalPages} />
        <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={validCurrentPage === totalPages} />
      </Pagination>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Custom styles for dropdown overlay */}
      <style dangerouslySetInnerHTML={{ __html: dropdownStyles }} />
      
      <div className="container-fluid px-4 py-5 bg-light min-vh-100" style={{ overflow: 'visible' }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="display-5 text-success mb-2">👥 User Management</h1>
            <p className="lead text-muted">Manage users, roles, and permissions</p>
          </div>
        <div>
          <Button 
            variant="outline-secondary" 
            onClick={() => onNavigate && onNavigate('admin')} 
            className="me-2"
          >
            ← Back to Dashboard
          </Button>
          <Button variant="success" onClick={handleCreateUser}>
            <i className="fas fa-plus me-1"></i>Add New User
          </Button>
        </div>
      </div>

      {/* Alert */}
      {alert.show && (
        <Alert variant={alert.variant} className="mb-4">
          {alert.message}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div style={{ fontSize: '2rem' }}>👥</div>
              <h4 className="text-primary mt-2">{stats.totalUsers}</h4>
              <small className="text-muted">Total Users</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div style={{ fontSize: '2rem' }}>✅</div>
              <h4 className="text-success mt-2">{stats.activeUsers}</h4>
              <small className="text-muted">Active Users</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div style={{ fontSize: '2rem' }}>🌾</div>
              <h4 className="text-warning mt-2">{stats.farmerUsers}</h4>
              <small className="text-muted">Farmers</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div style={{ fontSize: '2rem' }}>📈</div>
              <h4 className="text-info mt-2">{stats.newUsersThisMonth}</h4>
              <small className="text-muted">New This Month</small>
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
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <FormControl
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">Regular Users</option>
                <option value="farmer">Farmers</option>
                <option value="admin">Administrators</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={loadUsers} className="w-100">
                <i className="fas fa-sync me-1"></i>Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm" style={{ overflow: 'visible' }}>
        <Card.Header className="bg-success text-white">
          <h5 className="mb-0">Users ({filteredUsers.length})</h5>
        </Card.Header>
        <Card.Body className="p-0" style={{ overflowX: 'auto', overflowY: 'visible' }}>
          {currentUsers.length > 0 ? (
            <div style={{ position: 'relative', overflowY: 'visible' }}>
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>User Info</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                {currentUsers.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px', fontSize: '16px' }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold">{user.name}</div>
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{user.phone}</div>
                      <small className="text-muted">
                        {user.address?.city}, {user.address?.state}
                      </small>
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{getStatusBadge(user.isActive)}</td>
                    <td>
                      <small className="text-muted">
                        {formatDate(user.lastLogin)}
                      </small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(user.createdAt)}
                      </small>
                    </td>
                    <td>
                      <div className="table-dropdown-overlay" style={{ position: 'relative', zIndex: 1000 }}>
                        <Dropdown as={ButtonGroup} align="end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleUserAction(user, 'view')}
                          >
                            View
                          </Button>
                          <Dropdown.Toggle
                            split
                            variant="outline-primary"
                            size="sm"
                            id={`dropdown-${user._id}`}
                          />
                          <Dropdown.Menu>
                            <Dropdown.Item 
                              onClick={() => toggleUserStatus(user)}
                              className={user.isActive ? 'text-warning' : 'text-success'}
                            >
                              <i className={`fas fa-${user.isActive ? 'pause' : 'play'} me-2`}></i>
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              onClick={() => handleUserAction(user, 'delete')}
                              className="text-danger"
                            >
                              <i className="fas fa-trash me-2"></i>Delete User
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', opacity: 0.3 }}>
                {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all' ? '�' : '�👥'}
              </div>
              <h5 className="text-muted mt-3">
                {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all' 
                  ? 'No users match your filters' 
                  : 'No users found'
                }
              </h5>
              <p className="text-muted">
                {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all'
                  ? `Clear your filters or try different search criteria. Currently filtering: ${
                      [
                        searchTerm && `"${searchTerm}"`,
                        selectedRole !== 'all' && `Role: ${selectedRole}`,
                        selectedStatus !== 'all' && `Status: ${selectedStatus}`
                      ].filter(Boolean).join(', ')
                    }`
                  : 'Try creating a new user to get started.'
                }
              </p>
              {(searchTerm || selectedRole !== 'all' || selectedStatus !== 'all') && (
                <Button 
                  variant="outline-primary" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('all');
                    setSelectedStatus('all');
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Pagination */}
      {renderPagination()}

      {/* User Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'create' && 'Create New User'}
            {modalMode === 'edit' && `Edit User: ${selectedUser?.name}`}
            {modalMode === 'view' && `User Details: ${selectedUser?.name}`}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    required
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    required
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                    required
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role *</Form.Label>
                  <Form.Select
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                    disabled={modalMode === 'view'}
                  >
                    <option value="user">Regular User</option>
                    <option value="farmer">Farmer</option>
                    <option value="admin">Administrator</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {modalMode === 'create' && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password *</Form.Label>
                    <Form.Control
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      required
                      minLength={6}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password *</Form.Label>
                    <Form.Control
                      type="password"
                      value={userForm.confirmPassword}
                      onChange={(e) => setUserForm({...userForm, confirmPassword: e.target.value})}
                      required
                      minLength={6}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            <h6 className="mt-4 mb-3">Address Information</h6>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.address.street}
                    onChange={(e) => setUserForm({
                      ...userForm, 
                      address: {...userForm.address, street: e.target.value}
                    })}
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.address.city}
                    onChange={(e) => setUserForm({
                      ...userForm, 
                      address: {...userForm.address, city: e.target.value}
                    })}
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.address.state}
                    onChange={(e) => setUserForm({
                      ...userForm, 
                      address: {...userForm.address, state: e.target.value}
                    })}
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.address.country}
                    onChange={(e) => setUserForm({
                      ...userForm, 
                      address: {...userForm.address, country: e.target.value}
                    })}
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ZIP Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.address.zipCode}
                    onChange={(e) => setUserForm({
                      ...userForm, 
                      address: {...userForm.address, zipCode: e.target.value}
                    })}
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
            </Row>

            {modalMode !== 'view' && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Active User"
                  checked={userForm.isActive}
                  onChange={(e) => setUserForm({...userForm, isActive: e.target.checked})}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUserModal(false)}>
              {modalMode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {modalMode === 'view' && (
              <Button 
                variant="primary" 
                onClick={() => setModalMode('edit')}
              >
                <i className="fas fa-edit me-2"></i>Edit User
              </Button>
            )}
            {modalMode !== 'view' && (
              <Button variant="success" type="submit">
                {modalMode === 'create' ? 'Create User' : 'Update User'}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div style={{ fontSize: '3rem', color: '#dc3545' }}>⚠️</div>
            <h5 className="mt-3">Delete User Account</h5>
            <p className="text-muted">
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? 
              This action cannot be undone and will permanently remove all user data.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
      </div>
    </>
  );
};

export default UserManagement;
