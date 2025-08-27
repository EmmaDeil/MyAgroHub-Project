// API Configuration - Dynamic based on environment
const getApiBaseUrl = () => {
  // Production environment
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://your-backend-domain.com/api';
  }
  
  // Development environment - Fixed to use correct port
  return import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
};

const API_BASE_URL = getApiBaseUrl();

// API Client with token management
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('agrohub_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('agrohub_token', token);
    } else {
      localStorage.removeItem('agrohub_token');
    }
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create API instance
const api = new ApiClient();

// Authentication API
export const authAPI = {
  // Register user with fallback
  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData);
    } catch (error) {
      // Fallback registration when backend is not available
      console.warn('Backend unavailable, using fallback registration');
      
      const newUser = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: 'user',
        isAdmin: false,
        phone: userData.phone || '+234000000000',
        address: userData.address || {
          street: 'Not specified',
          city: 'Lagos',
          state: 'Lagos State',
          country: 'Nigeria'
        },
        billing: {
          fullName: userData.name,
          address: '',
          city: 'Lagos',
          state: 'Lagos State',
          postalCode: '',
          country: 'Nigeria'
        },
        profileImage: null, // Default to no profile image, will show generated avatar
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const mockToken = btoa(JSON.stringify({ 
        userId: newUser.id, 
        email: newUser.email, 
        role: 'user',
        exp: Date.now() + (24 * 60 * 60 * 1000)
      }));
      
      api.setToken(mockToken);
      
      return {
        success: true,
        data: {
          user: newUser,
          token: mockToken
        },
        message: 'Registration successful'
      };
    }
  },

  // Login user with fallback
  login: async (credentials) => {
    try {
      return await api.post('/auth/login', credentials);
    } catch (error) {
      // Fallback authentication when backend is not available
      console.warn('Backend unavailable, using fallback authentication');
      
      // Check for admin credentials
      if (credentials.email === 'eclefzy@gmail.com' && credentials.password === 'admin123') {
        const adminUser = {
          id: 'admin_001',
          name: 'Admin User',
          email: 'eclefzy@gmail.com',
          role: 'admin',
          isAdmin: true,
          phone: '+234800000000',
          address: {
            street: 'Admin Office',
            city: 'Lagos',
            state: 'Lagos State',
            country: 'Nigeria'
          },
          billing: {
            fullName: 'Admin User',
            address: 'Admin Office',
            city: 'Lagos',
            state: 'Lagos State',
            postalCode: '100001',
            country: 'Nigeria'
          },
          profileImage: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Generate a mock token
        const mockToken = btoa(JSON.stringify({ 
          userId: adminUser.id, 
          email: adminUser.email, 
          role: 'admin',
          exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));
        
        api.setToken(mockToken);
        
        return {
          success: true,
          data: {
            user: adminUser,
            token: mockToken
          },
          message: 'Login successful'
        };
      }
      
      // Check for demo user credentials
      if (credentials.email === 'demo@agrohub.com' && credentials.password === 'demo123') {
        // Check if we have existing user data in localStorage
        const existingUserData = localStorage.getItem('agrohub_current_user');
        let demoUser;
        
        if (existingUserData) {
          try {
            const storedUser = JSON.parse(existingUserData);
            if (storedUser.email === 'demo@agrohub.com') {
              // Use existing user data with any updates and mark as logged in
              demoUser = {
                ...storedUser,
                id: 'demo_001',
                role: 'user',
                isAdmin: false,
                isLoggedIn: true,
                lastLogin: new Date().toISOString()
              };
              console.log('Restored demo user data with profile image:', !!demoUser.profileImage);
            }
          } catch (e) {
            console.error('Error parsing stored user data:', e);
          }
        }
        
        // If no existing data, create default demo user
        if (!demoUser) {
          demoUser = {
            id: 'demo_001',
            name: 'Demo User',
            email: 'demo@agrohub.com',
            role: 'user',
            isAdmin: false,
            phone: '+234700000000',
            address: {
              street: 'Demo Street',
              city: 'Lagos',
              state: 'Lagos State',
              country: 'Nigeria'
            },
            billing: {
              fullName: 'Demo User',
              address: 'Demo Street',
              city: 'Lagos',
              state: 'Lagos State',
              postalCode: '100002',
              country: 'Nigeria'
            },
            profileImage: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          };
        }
        
        const mockToken = btoa(JSON.stringify({ 
          userId: demoUser.id, 
          email: demoUser.email, 
          role: 'user',
          exp: Date.now() + (24 * 60 * 60 * 1000)
        }));
        
        api.setToken(mockToken);
        
        return {
          success: true,
          data: {
            user: demoUser,
            token: mockToken
          },
          message: 'Login successful'
        };
      }
      
      // Additional fallback credentials
      if (credentials.email === 'admin@agrohub.com' && credentials.password === 'password') {
        const adminUser = {
          id: 'admin_002',
          name: 'System Admin',
          email: 'admin@agrohub.com',
          role: 'admin',
          isAdmin: true,
          phone: '+234800000001',
          address: {
            street: 'System Office',
            city: 'Lagos',
            state: 'Lagos State',
            country: 'Nigeria'
          },
          billing: {
            fullName: 'System Admin',
            address: 'System Office',
            city: 'Lagos',
            state: 'Lagos State',
            postalCode: '100003',
            country: 'Nigeria'
          },
          profileImage: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const mockToken = btoa(JSON.stringify({ 
          userId: adminUser.id, 
          email: adminUser.email, 
          role: 'admin',
          exp: Date.now() + (24 * 60 * 60 * 1000)
        }));
        
        api.setToken(mockToken);
        
        return {
          success: true,
          data: {
            user: adminUser,
            token: mockToken
          },
          message: 'Login successful'
        };
      }
      
      // Generic test user
      if (credentials.email === 'test@test.com' && credentials.password === 'test123') {
        const testUser = {
          id: 'test_001',
          name: 'Test User',
          email: 'test@test.com',
          role: 'user',
          isAdmin: false,
          phone: '+234700000001',
          address: {
            street: 'Test Street',
            city: 'Lagos',
            state: 'Lagos State',
            country: 'Nigeria'
          },
          billing: {
            fullName: 'Test User',
            address: 'Test Street',
            city: 'Lagos',
            state: 'Lagos State',
            postalCode: '100004',
            country: 'Nigeria'
          },
          profileImage: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const mockToken = btoa(JSON.stringify({ 
          userId: testUser.id, 
          email: testUser.email, 
          role: 'user',
          exp: Date.now() + (24 * 60 * 60 * 1000)
        }));
        
        api.setToken(mockToken);
        
        return {
          success: true,
          data: {
            user: testUser,
            token: mockToken
          },
          message: 'Login successful'
        };
      }
      
      // If no fallback matches, throw the original error
      throw new Error('Invalid credentials or backend unavailable');
    }
  },

  // Get current user
  getMe: () => api.get('/auth/me'),

  // Update profile
  updateProfile: async (data) => {
    try {
      return await api.put('/auth/profile', data);
    } catch (error) {
      // Fallback to localStorage update when backend is unavailable
      console.warn('Backend unavailable, updating profile in localStorage');
      
      const currentUserData = localStorage.getItem('agrohub_current_user');
      if (currentUserData) {
        const user = JSON.parse(currentUserData);
        const updatedUser = {
          ...user,
          ...data,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('agrohub_current_user', JSON.stringify(updatedUser));
        
        return {
          success: true,
          data: { user: updatedUser },
          message: 'Profile updated locally'
        };
      }
      
      throw new Error('No user session found');
    }
  },

  // Update profile image
  updateProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const url = `${api.baseURL}/auth/profile-image`;
    const headers = api.getHeaders();
    delete headers['Content-Type']; // Let browser set multipart/form-data boundary
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload profile image');
      }
      
      // Save to localStorage as backup after successful backend upload
      const currentUserData = localStorage.getItem('agritech_current_user');
      if (currentUserData) {
        const user = JSON.parse(currentUserData);
        const updatedUser = {
          ...user,
          ...data.data.user,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('agritech_current_user', JSON.stringify(updatedUser));
      }
      
      console.log('✅ Profile image uploaded to MongoDB successfully');
      return data;
    } catch (error) {
      console.warn('⚠️ Backend unavailable, falling back to localStorage for profile image');
      
      // Fallback: convert image to base64 and store locally
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Image = reader.result;
          
          const currentUserData = localStorage.getItem('agritech_current_user');
          if (currentUserData) {
            const user = JSON.parse(currentUserData);
            const updatedUser = {
              ...user,
              profileImage: base64Image,
              updatedAt: new Date().toISOString()
            };
            localStorage.setItem('agritech_current_user', JSON.stringify(updatedUser));
            
            resolve({
              success: true,
              data: { 
                user: updatedUser,
                profileImage: base64Image
              },
              message: 'Profile image updated locally (backend unavailable)'
            });
          } else {
            reject(new Error('No user session found'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });
    }
  },

  // Change password
  changePassword: (data) => api.put('/auth/change-password', data),

  // Logout
  logout: () => {
    api.setToken(null);
    return Promise.resolve({ success: true });
  }
};

// Products API
export const productsAPI = {
  // Get all products
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products${queryString ? `?${queryString}` : ''}`);
  },

  // Get single product
  getProduct: (id) => api.get(`/products/${id}`),

  // Seed sample products (for development)
  seedProducts: () => api.post('/products/seed', {})
};

// Orders API
export const ordersAPI = {
  // Create order
  createOrder: (orderData) => api.post('/orders', orderData),

  // Get user orders
  getOrders: () => api.get('/orders'),

  // Get single order
  getOrder: (id) => api.get(`/orders/${id}`),

  // Cancel order
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`, {})
};

// Admin API
export const adminAPI = {
  // Get dashboard stats
  getDashboard: () => api.get('/admin/dashboard'),

  // Get all orders
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/orders${queryString ? `?${queryString}` : ''}`);
  },

  // Update order status
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),

  // USER MANAGEMENT
  // Get all users with filtering and pagination
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  // Get single user by ID
  getUser: (id) => api.get(`/admin/users/${id}`),

  // Create new user
  createUser: (userData) => api.post('/admin/users', userData),

  // Update user
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),

  // Delete user
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Bulk update users
  bulkUpdateUsers: (data) => api.patch('/admin/users/bulk', data),

  // Toggle user status (legacy support)
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`, {}),

  // Get farmers
  getFarmers: () => api.get('/admin/farmers'),

  // Verify/Unverify farmer
  verifyFarmer: (id, isVerified, rejectionDetails = null) => {
    const payload = { isVerified };
    if (!isVerified && rejectionDetails) {
      payload.rejectionReason = rejectionDetails.rejectionReason;
      payload.requiredDocuments = rejectionDetails.requiredDocuments;
      payload.adminNotes = rejectionDetails.adminNotes;
    }
    return api.put(`/admin/farmers/${id}/verify`, payload);
  },

  // Send SMS to farmer
  sendSms: (data) => api.post('/admin/sms/farmer', data)
};

// Farmers API
export const farmersAPI = {
  // Get all farmers
  getFarmers: () => api.get('/farmers'),

  // Get single farmer
  getFarmer: (id) => api.get(`/farmers/${id}`)
};

// Export API client for direct use
export { api };

// Utility functions
export const apiUtils = {
  // Set authentication token
  setToken: (token) => api.setToken(token),

  // Clear authentication
  clearAuth: () => {
    api.setToken(null);
    // Preserve user profile data but remove sensitive authentication info
    const currentUserData = localStorage.getItem('agritech_current_user');
    if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData);
        // Keep profile data but mark as logged out
        const preservedUser = {
          ...user,
          isLoggedIn: false,
          lastLogout: new Date().toISOString()
        };
        localStorage.setItem('agritech_current_user', JSON.stringify(preservedUser));
      } catch (e) {
        console.error('Error preserving user data during logout:', e);
        localStorage.removeItem('agritech_current_user');
      }
    }
  },

  // Handle authentication response
  handleAuthResponse: (response) => {
    if (response.success && (response.token || response.data.token)) {
      const token = response.token || response.data.token;
      const user = response.user || response.data.user;
      
      api.setToken(token);
      localStorage.setItem('agritech_current_user', JSON.stringify(user));
      return user;
    }
    throw new Error(response.message || 'Authentication failed');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('agritech_current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!api.token && !!apiUtils.getCurrentUser();
  },

  // Check if user is admin
  isAdmin: () => {
    const user = apiUtils.getCurrentUser();
    return user && user.role === 'admin';
  }
};
