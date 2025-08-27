import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, Image } from 'react-bootstrap';
import { authAPI } from '../services/api';

const UserSettings = ({ user, onUpdateUser, onNavigate }) => {
  const [formData, setFormData] = useState({
    name: user.name || user.firstName || '',
    email: user.email || '',
    phone: user.phone || '',
    address: {
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      country: user.address?.country || 'Nigeria'
    },
    billing: {
      fullName: user.billing?.fullName || user.name || user.firstName || '',
      address: user.billing?.address || '',
      city: user.billing?.city || '',
      state: user.billing?.state || '',
      postalCode: user.billing?.postalCode || '',
      country: user.billing?.country || 'Nigeria'
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    // If no password fields are filled, skip password validation
    if (!currentPassword && !newPassword && !confirmPassword) {
      return { isValid: true, message: '' };
    }
    
    // If any password field is filled, all must be filled
    if (!currentPassword || !newPassword || !confirmPassword) {
      return { isValid: false, message: 'Please fill all password fields or leave them all blank' };
    }
    
    // Password strength validation
    if (newPassword.length < 6) {
      return { isValid: false, message: 'New password must be at least 6 characters long' };
    }
    
    // Confirm password match
    if (newPassword !== confirmPassword) {
      return { isValid: false, message: 'New password and confirmation do not match' };
    }
    
    // Current password should not be same as new password
    if (currentPassword === newPassword) {
      return { isValid: false, message: 'New password must be different from current password' };
    }
    
    return { isValid: true, message: '' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('billing.')) {
      const billingField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billing: {
          ...prev.billing,
          [billingField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    console.log('File input changed:', e.target.files); // Debug log
    
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file.name, file.size, file.type); // Debug log
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setAlert({
          show: true,
          message: 'Image size should be less than 5MB',
          variant: 'danger'
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setAlert({
          show: true,
          message: 'Please select a valid image file',
          variant: 'danger'
        });
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Image loaded for preview'); // Debug log
        setPreviewImage(e.target.result);
      };
      reader.onerror = (e) => {
        console.error('Error reading file:', e);
        setAlert({
          show: true,
          message: 'Error reading the selected file',
          variant: 'danger'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Camera button clicked'); // Debug log
    
    const fileInput = document.getElementById('profileImageInput');
    console.log('File input element:', fileInput); // Debug log
    
    if (fileInput) {
      try {
        fileInput.click();
        console.log('File input clicked'); // Debug log
      } catch (error) {
        console.error('Error clicking file input:', error);
        
        // Fallback method
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        fileInput.dispatchEvent(event);
      }
    } else {
      console.error('File input not found');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate password changes if any
      const passwordValidation = validatePassword();
      if (!passwordValidation.isValid) {
        setAlert({
          show: true,
          message: passwordValidation.message,
          variant: 'danger'
        });
        setLoading(false);
        return;
      }
      
      let updatedUser = user;
      
      // Update profile image if a new one was selected
      if (profileImage) {
        try {
          const imageResponse = await authAPI.updateProfileImage(profileImage);
          updatedUser = imageResponse.data.user;
        } catch (imageError) {
          console.error('Profile image upload failed:', imageError);
          // Continue with profile update even if image upload fails
          setAlert({
            show: true,
            message: 'Profile image upload failed, but other changes will be saved.',
            variant: 'warning'
          });
        }
      }
      
      // Update other profile data
      const profileUpdateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        preferences: formData.preferences || user.preferences
      };
      
      // Add profile image data if we have it from preview or existing
      if (previewImage && !profileImage) {
        profileUpdateData.profileImage = previewImage;
      }
      
      try {
        const profileResponse = await authAPI.updateProfile(profileUpdateData);
        updatedUser = { ...updatedUser, ...profileResponse.data.user };
      } catch (profileError) {
        // Fallback to localStorage update if backend is unavailable
        console.warn('Backend unavailable, updating profile locally');
        updatedUser = {
          ...user,
          ...formData,
          profileImage: previewImage || updatedUser.profileImage || user.profileImage,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('agrohub_current_user', JSON.stringify(updatedUser));
      }
      
      // Handle password change if requested
      const isPasswordChange = passwordData.currentPassword && passwordData.newPassword;
      if (isPasswordChange) {
        try {
          await authAPI.changePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          });
          
          // Clear password fields after successful update
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          
          setAlert({
            show: true,
            message: 'Profile and password updated successfully! Please login again with your new password.',
            variant: 'success'
          });
        } catch (passwordError) {
          setAlert({
            show: true,
            message: passwordError.message || 'Failed to change password. Profile changes were saved.',
            variant: 'warning'
          });
        }
      } else {
        setAlert({
          show: true,
          message: 'Profile updated successfully!',
          variant: 'success'
        });
      }
      
      // Update the user in the app state
      onUpdateUser(updatedUser);
      
      // Clear the preview image and selected file after successful update
      setProfileImage(null);
      setPreviewImage(null);
      
      setTimeout(() => {
        setAlert({ show: false, message: '', variant: 'success' });
      }, 3000);
      
    } catch (error) {
      console.error('Profile update error:', error);
      setAlert({
        show: true,
        message: error.message || 'Failed to update profile. Please try again.',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0 min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-success text-white py-4 mb-4">
        <div className="container">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-outline-light me-3"
              onClick={() => onNavigate('dashboard')}
            >
              <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
            </button>
            <div>
              <h2 className="mb-0">
                <i className="fas fa-cog me-2"></i>Account Settings
              </h2>
              <p className="mb-0 opacity-75">Manage your profile information and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <Row>
          <Col lg={8} className="mx-auto">
            {alert.show && (
              <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false })}>
                {alert.message}
              </Alert>
            )}

            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white border-bottom-0 py-4">
                <h4 className="mb-0 text-success">
                  <i className="fas fa-user-edit me-2"></i>Profile Information
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {/* Profile Picture Section */}
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      <Image
                        src={previewImage || user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=28a745&color=fff&size=120`}
                        alt="Profile"
                        width={120}
                        height={120}
                        className="rounded-circle border border-3 border-success"
                        style={{ objectFit: 'cover' }}
                      />
                      <button 
                        type="button"
                        onClick={handleCameraClick}
                        className="position-absolute btn btn-success btn-sm rounded-circle border-2 border-white"
                        style={{ 
                          bottom: '5px',
                          right: '5px',
                          cursor: 'pointer',
                          zIndex: 10,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          width: '32px',
                          height: '32px',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Upload profile picture"
                      >
                        <i className="fas fa-camera" style={{ fontSize: '12px' }}></i>
                      </button>
                      
                      <input
                        type="file"
                        id="profileImageInput"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                    
                    <div className="mt-3">
                      <small className="text-muted d-block mb-1">Click the camera icon to upload a new photo</small>
                      <small className="text-muted">Max file size: 5MB</small>
                    </div>
                    
                    {/* Alternative upload button for easier access */}
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm mt-2"
                      onClick={handleCameraClick}
                    >
                      <i className="fas fa-upload me-1"></i>
                      Choose Photo
                    </button>
                  </div>

                  <Row>
                    {/* Personal Information */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-user me-2 text-success"></i>Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="border-2"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-envelope me-2 text-success"></i>Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="border-2"
                          disabled
                        />
                        <Form.Text className="text-muted">
                          Email cannot be changed for security reasons
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-phone me-2 text-success"></i>Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          className="border-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Address Information */}
                  <h5 className="text-success mt-4 mb-3">
                    <i className="fas fa-map-marker-alt me-2"></i>Address Information
                  </h5>
                  
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Street Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          placeholder="Enter your street address"
                          className="border-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">City</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                          className="border-2"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">State</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          placeholder="Enter state"
                          className="border-2"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Country</Form.Label>
                        <Form.Select
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleInputChange}
                          className="border-2"
                        >
                          <option value="Nigeria">Nigeria</option>
                          <option value="Ghana">Ghana</option>
                          <option value="Kenya">Kenya</option>
                          <option value="South Africa">South Africa</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Billing Information */}
                  <h5 className="text-success mt-4 mb-3">
                    <i className="fas fa-credit-card me-2"></i>Billing Information
                  </h5>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Billing Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="billing.fullName"
                          value={formData.billing.fullName}
                          onChange={handleInputChange}
                          placeholder="Full name for billing"
                          className="border-2"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Postal/ZIP Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="billing.postalCode"
                          value={formData.billing.postalCode}
                          onChange={handleInputChange}
                          placeholder="Enter postal code"
                          className="border-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Billing Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="billing.address"
                          value={formData.billing.address}
                          onChange={handleInputChange}
                          placeholder="Enter billing address"
                          className="border-2"
                        />
                        <Form.Text className="text-muted">
                          <Form.Check 
                            type="checkbox"
                            id="sameAsShipping"
                            label="Same as shipping address"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  billing: {
                                    ...prev.billing,
                                    address: prev.address.street,
                                    city: prev.address.city,
                                    state: prev.address.state,
                                    country: prev.address.country
                                  }
                                }));
                              }
                            }}
                            className="mt-2"
                          />
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Billing City</Form.Label>
                        <Form.Control
                          type="text"
                          name="billing.city"
                          value={formData.billing.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                          className="border-2"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Billing State</Form.Label>
                        <Form.Control
                          type="text"
                          name="billing.state"
                          value={formData.billing.state}
                          onChange={handleInputChange}
                          placeholder="Enter state"
                          className="border-2"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Billing Country</Form.Label>
                        <Form.Select
                          name="billing.country"
                          value={formData.billing.country}
                          onChange={handleInputChange}
                          className="border-2"
                        >
                          <option value="Nigeria">Nigeria</option>
                          <option value="Ghana">Ghana</option>
                          <option value="Kenya">Kenya</option>
                          <option value="South Africa">South Africa</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Security Settings */}
                  <h5 className="text-success mt-4 mb-3">
                    <i className="fas fa-shield-alt me-2"></i>Security Settings
                  </h5>
                  
                  {/* Password Change Status */}
                  {(passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword) && (
                    <div className="mb-3">
                      <div className="card border-info">
                        <div className="card-body py-2">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-info-circle text-info me-2"></i>
                            <small className="text-info">
                              <strong>Password Change Mode:</strong> Fill all password fields to update your password
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Current Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          className="border-2"
                        />
                        <Form.Text className="text-muted">
                          Leave blank if you don't want to change password
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className={`border-2 ${
                            passwordData.newPassword && passwordData.newPassword.length < 6 
                              ? 'border-danger' 
                              : passwordData.newPassword && passwordData.newPassword.length >= 6 
                              ? 'border-success' 
                              : ''
                          }`}
                        />
                        <Form.Text className={
                          passwordData.newPassword && passwordData.newPassword.length < 6 
                            ? 'text-danger' 
                            : passwordData.newPassword && passwordData.newPassword.length >= 6 
                            ? 'text-success' 
                            : 'text-muted'
                        }>
                          {passwordData.newPassword 
                            ? passwordData.newPassword.length < 6 
                              ? 'Too short - minimum 6 characters required' 
                              : 'Good password length!' 
                            : 'Must be at least 6 characters long'
                          }
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          className={`border-2 ${
                            passwordData.confirmPassword && passwordData.newPassword 
                              ? passwordData.confirmPassword === passwordData.newPassword 
                                ? 'border-success' 
                                : 'border-danger'
                              : ''
                          }`}
                        />
                        <Form.Text className={
                          passwordData.confirmPassword && passwordData.newPassword 
                            ? passwordData.confirmPassword === passwordData.newPassword 
                              ? 'text-success' 
                              : 'text-danger'
                            : 'text-muted'
                        }>
                          {passwordData.confirmPassword && passwordData.newPassword
                            ? passwordData.confirmPassword === passwordData.newPassword 
                              ? 'Passwords match!' 
                              : 'Passwords do not match'
                            : 'Must match the new password'
                          }
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => onNavigate('dashboard')}
                      disabled={loading}
                    >
                      <i className="fas fa-times me-2"></i>Cancel
                    </Button>
                    
                    <Button 
                      type="submit" 
                      variant="success" 
                      disabled={loading}
                      className="px-4"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Security Section */}
            <Card className="shadow-sm border-0 mt-4">
              <Card.Header className="bg-white border-bottom-0 py-4">
                <h4 className="mb-0 text-success">
                  <i className="fas fa-shield-alt me-2"></i>Security Settings
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                  <div>
                    <h6 className="mb-1">Change Password</h6>
                    <small className="text-muted">Update your account password</small>
                  </div>
                  <Button variant="outline-success" size="sm">
                    <i className="fas fa-key me-2"></i>Change Password
                  </Button>
                </div>
                
                <div className="d-flex justify-content-between align-items-center py-3">
                  <div>
                    <h6 className="mb-1">Two-Factor Authentication</h6>
                    <small className="text-muted">Add an extra layer of security</small>
                  </div>
                  <Button variant="outline-success" size="sm">
                    <i className="fas fa-mobile-alt me-2"></i>Enable 2FA
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default UserSettings;
