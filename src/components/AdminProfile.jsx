import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import { adminAPI } from '../services/api';

const AdminProfile = ({ user, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('sms');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [loading, setLoading] = useState(false);

  // SMS Configuration State
  const [smsConfig, setSmsConfig] = useState({
    provider: 'africastalking',
    africastalking: {
      username: '',
      apiKey: '',
      sandbox: true
    },
    twilio: {
      accountSid: '',
      authToken: '',
      phoneNumber: ''
    },
    isEnabled: false
  });

  // Admin Privileges State
  const [adminSettings, setAdminSettings] = useState({
    canManageUsers: true,
    canManageFarmers: true,
    canManageProducts: true,
    canManageOrders: true,
    canViewReports: true,
    canConfigureSystem: true,
    maxUsersAllowed: 1000,
    maxFarmersAllowed: 500,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    autoApproveFarmers: false,
    systemMaintenanceMode: false
  });

  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalFarmers: 0,
    pendingFarmers: 0,
    totalOrders: 0,
    systemHealth: 95
  });

  useEffect(() => {
    loadSmsConfig();
    loadAdminSettings();
    loadStatistics();
  }, []);

  const loadSmsConfig = () => {
    const config = JSON.parse(localStorage.getItem('agrohub_sms_config') || '{}');
    if (Object.keys(config).length > 0) {
      setSmsConfig(prev => ({ ...prev, ...config }));
    }
  };

  const loadAdminSettings = () => {
    const settings = JSON.parse(localStorage.getItem('agrohub_admin_settings') || '{}');
    if (Object.keys(settings).length > 0) {
      setAdminSettings(prev => ({ ...prev, ...settings }));
    }
  };

  const loadStatistics = () => {
    // This would typically fetch from API
    setStats({
      totalUsers: 156,
      activeUsers: 142,
      totalFarmers: 45,
      pendingFarmers: 8,
      totalOrders: 324,
      systemHealth: 95
    });
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 5000);
  };

  const handleSmsConfigUpdate = (e) => {
    e.preventDefault();
    localStorage.setItem('agrohub_sms_config', JSON.stringify(smsConfig));
    showAlert('SMS configuration saved successfully!', 'success');
  };

  const handleAdminSettingsUpdate = (e) => {
    e.preventDefault();
    localStorage.setItem('agrohub_admin_settings', JSON.stringify(adminSettings));
    showAlert('User privileges updated successfully!', 'success');
  };

  return (
    <div>
      <AdminNavbar user={user} onLogout={onLogout} onNavigate={onNavigate} />
      
      <Container fluid className="py-4">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>
                <i className="fas fa-cog me-2 text-success"></i>
                System Configuration
              </h2>
              <Button 
                variant="outline-secondary"
                onClick={() => onNavigate && onNavigate('admin')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to Dashboard
              </Button>
            </div>
            
            {alert.show && (
              <Alert variant={alert.variant} className="mb-4">
                {alert.message}
              </Alert>
            )}

            {/* Navigation Bar Style Tabs */}
            <div className="bg-white border-bottom mb-4 sticky-top">
              <Container fluid>
                <nav className="navbar navbar-expand-lg navbar-light">
                  <div className="navbar-nav flex-row gap-3">
                    <button
                      className={`btn ${activeTab === 'sms' ? 'btn-success' : 'btn-outline-success'} btn-sm`}
                      onClick={() => setActiveTab('sms')}
                    >
                      <i className="fas fa-sms me-2"></i>SMS Configuration
                    </button>
                    <button
                      className={`btn ${activeTab === 'privileges' ? 'btn-success' : 'btn-outline-success'} btn-sm`}
                      onClick={() => setActiveTab('privileges')}
                    >
                      <i className="fas fa-crown me-2"></i>User Privileges
                    </button>
                  </div>
                </nav>
              </Container>
            </div>

            {/* Content Area */}
            <div className="tab-content">{activeTab === 'sms' && (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">SMS Service Configuration</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSmsConfigUpdate}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Enable SMS Notifications"
                        checked={smsConfig.isEnabled}
                        onChange={(e) => setSmsConfig(prev => ({
                          ...prev,
                          isEnabled: e.target.checked
                        }))}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>SMS Provider</Form.Label>
                      <Form.Select
                        value={smsConfig.provider}
                        onChange={(e) => setSmsConfig(prev => ({
                          ...prev,
                          provider: e.target.value
                        }))}
                      >
                        <option value="africastalking">Africa's Talking</option>
                        <option value="twilio">Twilio</option>
                      </Form.Select>
                    </Form.Group>

                    {smsConfig.provider === 'africastalking' && (
                      <>
                        <h6 className="mt-4 mb-3">Africa's Talking Configuration</h6>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Username</Form.Label>
                              <Form.Control
                                type="text"
                                value={smsConfig.africastalking.username}
                                onChange={(e) => setSmsConfig(prev => ({
                                  ...prev,
                                  africastalking: {
                                    ...prev.africastalking,
                                    username: e.target.value
                                  }
                                }))}
                                placeholder="Your Africa's Talking username"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>API Key</Form.Label>
                              <Form.Control
                                type="password"
                                value={smsConfig.africastalking.apiKey}
                                onChange={(e) => setSmsConfig(prev => ({
                                  ...prev,
                                  africastalking: {
                                    ...prev.africastalking,
                                    apiKey: e.target.value
                                  }
                                }))}
                                placeholder="Your API key"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Check
                          type="checkbox"
                          label="Use Sandbox Environment"
                          checked={smsConfig.africastalking.sandbox}
                          onChange={(e) => setSmsConfig(prev => ({
                            ...prev,
                            africastalking: {
                              ...prev.africastalking,
                              sandbox: e.target.checked
                            }
                          }))}
                          className="mb-3"
                        />
                      </>
                    )}

                    {smsConfig.provider === 'twilio' && (
                      <>
                        <h6 className="mt-4 mb-3">Twilio Configuration</h6>
                        <Row>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Account SID</Form.Label>
                              <Form.Control
                                type="text"
                                value={smsConfig.twilio.accountSid}
                                onChange={(e) => setSmsConfig(prev => ({
                                  ...prev,
                                  twilio: {
                                    ...prev.twilio,
                                    accountSid: e.target.value
                                  }
                                }))}
                                placeholder="Your Twilio Account SID"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Auth Token</Form.Label>
                              <Form.Control
                                type="password"
                                value={smsConfig.twilio.authToken}
                                onChange={(e) => setSmsConfig(prev => ({
                                  ...prev,
                                  twilio: {
                                    ...prev.twilio,
                                    authToken: e.target.value
                                  }
                                }))}
                                placeholder="Your Auth Token"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Phone Number</Form.Label>
                              <Form.Control
                                type="tel"
                                value={smsConfig.twilio.phoneNumber}
                                onChange={(e) => setSmsConfig(prev => ({
                                  ...prev,
                                  twilio: {
                                    ...prev.twilio,
                                    phoneNumber: e.target.value
                                  }
                                }))}
                                placeholder="+1234567890"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </>
                    )}

                    <Button type="submit" variant="success">
                      Save SMS Configuration
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {activeTab === 'privileges' && (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">User Privileges & Access Control</h5>
                  <p className="mb-0 text-muted small">Set permissions and access rights for users and farmers</p>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleAdminSettingsUpdate}>
                    <Row>
                      <Col md={6}>
                        <Card className="border-success mb-4">
                          <Card.Header className="bg-success text-white">
                            <h6 className="mb-0">
                              <i className="fas fa-users me-2"></i>Regular Users Permissions
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            <Form.Check
                              type="checkbox"
                              label="Can View Product Listings"
                              checked={adminSettings.canManageProducts}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                canManageProducts: e.target.checked
                              }))}
                              className="mb-2"
                            />
                            <Form.Check
                              type="checkbox"
                              label="Can Place Orders"
                              checked={adminSettings.canManageOrders}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                canManageOrders: e.target.checked
                              }))}
                              className="mb-2"
                            />
                            <Form.Check
                              type="checkbox"
                              label="Can Contact Farmers"
                              checked={adminSettings.canViewReports}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                canViewReports: e.target.checked
                              }))}
                              className="mb-2"
                            />
                            <Form.Check
                              type="checkbox"
                              label="Can Leave Reviews"
                              checked={adminSettings.canConfigureSystem}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                canConfigureSystem: e.target.checked
                              }))}
                              className="mb-2"
                            />
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={6}>
                        <Card className="border-warning mb-4">
                          <Card.Header className="bg-warning text-dark">
                            <h6 className="mb-0">
                              <i className="fas fa-seedling me-2"></i>Farmer Permissions
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            <Form.Check
                              type="checkbox"
                              label="Can List Products"
                              checked={adminSettings.canManageFarmers}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                canManageFarmers: e.target.checked
                              }))}
                              className="mb-2"
                            />
                            <Form.Check
                              type="checkbox"
                              label="Can Manage Inventory"
                              checked={adminSettings.canManageUsers}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                canManageUsers: e.target.checked
                              }))}
                              className="mb-2"
                            />
                            <Form.Check
                              type="checkbox"
                              label="Can View Analytics"
                              checked={adminSettings.requireEmailVerification}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                requireEmailVerification: e.target.checked
                              }))}
                              className="mb-2"
                            />
                            <Form.Check
                              type="checkbox"
                              label="Can Export Data"
                              checked={adminSettings.requirePhoneVerification}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                requirePhoneVerification: e.target.checked
                              }))}
                              className="mb-2"
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Card className="border-info mb-4">
                      <Card.Header className="bg-info text-white">
                        <h6 className="mb-0">
                          <i className="fas fa-cog me-2"></i>System Access Limits
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Maximum Users Allowed</Form.Label>
                              <Form.Control
                                type="number"
                                value={adminSettings.maxUsersAllowed}
                                onChange={(e) => setAdminSettings(prev => ({
                                  ...prev,
                                  maxUsersAllowed: parseInt(e.target.value)
                                }))}
                              />
                              <Form.Text className="text-muted">
                                Set the maximum number of regular users that can register
                              </Form.Text>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Maximum Farmers Allowed</Form.Label>
                              <Form.Control
                                type="number"
                                value={adminSettings.maxFarmersAllowed}
                                onChange={(e) => setAdminSettings(prev => ({
                                  ...prev,
                                  maxFarmersAllowed: parseInt(e.target.value)
                                }))}
                              />
                              <Form.Text className="text-muted">
                                Set the maximum number of farmers that can register
                              </Form.Text>
                            </Form.Group>
                          </Col>
                        </Row>

                        <h6 className="mt-4 mb-3">Registration & Approval Settings</h6>
                        <Row>
                          <Col md={6}>
                            <Form.Check
                              type="checkbox"
                              label="Auto-approve New Farmers"
                              checked={adminSettings.autoApproveFarmers}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                autoApproveFarmers: e.target.checked
                              }))}
                              className="mb-2"
                            />
                            <Form.Text className="text-muted d-block mb-3">
                              When enabled, new farmers will be automatically approved without manual review
                            </Form.Text>
                          </Col>
                          <Col md={6}>
                            <Form.Check
                              type="checkbox"
                              label="Maintenance Mode"
                              checked={adminSettings.systemMaintenanceMode}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                systemMaintenanceMode: e.target.checked
                              }))}
                              className="mb-2"
                            />
                            <Form.Text className="text-muted d-block mb-3">
                              When enabled, only admins can access the system
                            </Form.Text>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    <Button type="submit" variant="success" className="btn-lg">
                      <i className="fas fa-save me-2"></i>
                      Save User Privileges Settings
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminProfile;
