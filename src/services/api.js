// API Configuration - Dynamic based on environment
const getApiBaseUrl = () => {
  // Production environment
  if (import.meta.env.PROD) {
    return (
      import.meta.env.VITE_API_URL || "https://your-backend-domain.com/api"
    );
  }

  // Development environment - Fixed to use correct port
  return import.meta.env.VITE_API_URL || "http://localhost:5002/api";
};

const API_BASE_URL = getApiBaseUrl();

// API Client with token management
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("agrohub_token");
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("agrohub_token", token);
    } else {
      localStorage.removeItem("agrohub_token");
    }
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
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
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // GET request
  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  // POST request
  post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

// Create API instance
const api = new ApiClient();

// Authentication API
export const authAPI = {
  // Register user - Backend only, no fallback
  register: async (userData) => {
    return await api.post("/auth/register", userData);
  },

  // Login user - Backend only, no fallback
  login: async (credentials) => {
    return await api.post("/auth/login", credentials);
  },

  // Get current user
  getMe: () => api.get("/auth/me"),

  // Update profile - Backend only, no fallback
  updateProfile: async (data) => {
    return await api.put("/auth/profile", data);
  },

  // Update profile image - Backend only, no fallback
  updateProfileImage: async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file);

    const url = `${api.baseURL}/auth/profile-image`;
    const headers = api.getHeaders();
    delete headers["Content-Type"]; // Let browser set multipart/form-data boundary

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload profile image");
    }

    return data;
  },

  // Upload verification document for approval
  uploadVerification: async (file) => {
    const formData = new FormData();
    formData.append('document', file);

    const url = `${api.baseURL}/users/verify`;
    const headers = api.getHeaders();
    delete headers['Content-Type'];

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload verification document');
    }

    return data;
  },

  // Change password
  changePassword: (data) => api.put("/auth/change-password", data),

  // Forgot password - request reset link
  forgotPassword: (data) => api.post("/auth/forgot-password", data),

  // Reset password using token
  resetPassword: (data) => api.post("/auth/reset-password", data),

  // Logout
  logout: () => {
    api.setToken(null);
    return Promise.resolve({ success: true });
  },
};

// Products API
export const productsAPI = {
  // Get all products
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products${queryString ? `?${queryString}` : ""}`);
  },

  // Get single product
  getProduct: (id) => api.get(`/products/${id}`),

  // Seed sample products (for development)
  seedProducts: () => api.post("/products/seed", {}),
};

// Orders API
export const ordersAPI = {
  // Create order
  createOrder: (orderData) => api.post("/orders", orderData),

  // Get user orders
  getOrders: () => api.get("/orders"),

  // Get single order
  getOrder: (id) => api.get(`/orders/${id}`),

  // Cancel order
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`, {}),
};

// Admin API
export const adminAPI = {
  // Get dashboard stats
  getDashboard: () => api.get("/admin/dashboard"),

  // Get all orders
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/orders${queryString ? `?${queryString}` : ""}`);
  },

  // Update order status
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),

  // USER MANAGEMENT
  // Get all users with filtering and pagination
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users${queryString ? `?${queryString}` : ""}`);
  },

  // Get pending verifications
  getVerifications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/verifications${queryString ? `?${queryString}` : ""}`);
  },

  // Update a verification (approve/reject)
  updateVerification: (id, data) => api.put(`/admin/verifications/${id}`, data),

  // Get single user by ID
  getUser: (id) => api.get(`/admin/users/${id}`),

  // Create new user
  createUser: (userData) => api.post("/admin/users", userData),

  // Update user
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),

  // Delete user
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Bulk update users
  bulkUpdateUsers: (data) => api.patch("/admin/users/bulk", data),

  // Toggle user status (legacy support)
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`, {}),

  // FARMER MANAGEMENT
  // Get farmers
  getFarmers: () => api.get("/admin/farmers"),

  // Create new farmer
  createFarmer: (farmerData) => api.post("/admin/farmers", farmerData),

  // Update farmer
  updateFarmer: (id, farmerData) => api.put(`/admin/farmers/${id}`, farmerData),

  // Delete farmer
  deleteFarmer: (id) => api.delete(`/admin/farmers/${id}`),

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

  // PRODUCT MANAGEMENT
  // Get all products (admin view)
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/products${queryString ? `?${queryString}` : ""}`);
  },

  // Create new product
  createProduct: (productData) => api.post("/admin/products", productData),

  // Update product
  updateProduct: (id, productData) =>
    api.put(`/admin/products/${id}`, productData),

  // Delete product
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Send SMS to farmer
  sendSms: (data) => api.post("/admin/sms/farmer", data),

  // Get reports and analytics
  getReports: (period = "7days") => api.get(`/admin/reports?period=${period}`),

  // Get notifications
  getNotifications: () => api.get("/admin/notifications"),

  // Get system alerts
  getAlerts: () => api.get("/admin/alerts"),

  // Get top selling products
  getTopProducts: (limit = 5) => api.get(`/admin/top-products?limit=${limit}`),
};

// Farmers API
export const farmersAPI = {
  // Get all farmers
  getFarmers: () => api.get("/farmers"),

  // Get single farmer
  getFarmer: (id) => api.get(`/farmers/${id}`),
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
    const currentUserData = localStorage.getItem("agritech_current_user");
    if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData);
        // Keep profile data but mark as logged out
        const preservedUser = {
          ...user,
          isLoggedIn: false,
          lastLogout: new Date().toISOString(),
        };
        localStorage.setItem(
          "agritech_current_user",
          JSON.stringify(preservedUser)
        );
      } catch (e) {
        console.error("Error preserving user data during logout:", e);
        localStorage.removeItem("agritech_current_user");
      }
    }
  },

  // Handle authentication response
  handleAuthResponse: (response) => {
    if (response.success && (response.token || response.data.token)) {
      const token = response.token || response.data.token;
      const user = response.user || response.data.user;

      api.setToken(token);
      localStorage.setItem("agritech_current_user", JSON.stringify(user));
      return user;
    }
    throw new Error(response.message || "Authentication failed");
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem("agritech_current_user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!api.token && !!apiUtils.getCurrentUser();
  },

  // Check if user is admin
  isAdmin: () => {
    const user = apiUtils.getCurrentUser();
    return user && user.role === "admin";
  },
};
