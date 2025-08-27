# AgroHub Login Instructions

## Backend Status
The backend server is running on port 5001, with full MongoDB Atlas integration and localStorage fallback for offline functionality.

## Available Login Credentials

### Admin Accounts (Full Admin Access)
1. **Primary Admin**
   - **Email**: eclefzy@gmail.com
   - **Password**: admin123

2. **System Admin** 
   - **Email**: admin@agrohub.com
   - **Password**: password

### Customer Accounts
1. **Demo User**
   - **Email**: demo@agrohub.com
   - **Password**: demo123

2. **Test User**
   - **Email**: test@test.com
   - **Password**: test123

### Additional Test Accounts
3. **Farmer Account**
   - **Email**: farmer@agrohub.com
   - **Password**: farmer123
   - **Role**: Farmer (Can list products, manage inventory)

4. **Customer Account**
   - **Email**: customer@agrohub.com  
   - **Password**: customer123
   - **Role**: Regular Customer

## Quick Login Options

### 🚀 **For Demo/Testing** (Recommended)
- **Email**: `demo@agrohub.com`
- **Password**: `demo123`
- **Access**: Full customer features, shopping cart, orders

### 🔧 **For Admin Testing**
- **Email**: `admin@agrohub.com`
- **Password**: `password`
- **Access**: Full admin dashboard, user management, system settings

### 👨‍🌾 **For Farmer Testing**
- **Email**: `farmer@agrohub.com`
- **Password**: `farmer123`
- **Access**: Product management, inventory, farmer dashboard

## Login Process

### Step 1: Access the Application
1. Open your browser
2. Navigate to: **http://localhost:5175/** (current port)
3. You'll see the AgroHub landing page

### Step 2: Open Login Modal
1. Click **"Sign In"** button in the top navigation
2. Or click any **"Try Demo Account"** button for quick access

### Step 3: Enter Credentials
1. **Email**: Use any of the emails above
2. **Password**: Use corresponding password
3. Click **"Sign In"** button

### Step 4: Access Features
- **Admin Users**: Redirected to Admin Dashboard
- **Regular Users**: Access to marketplace and shopping
- **Farmers**: Access to farmer tools and product management

## Features Available in Offline Mode
1. **Admin Dashboard**: Full admin functionality including order management and farmer coordination
2. **Product Browsing**: View all 24+ products with detailed information
3. **Shopping Cart**: Add products to cart and simulate ordering process
4. **User Authentication**: Login/Register with fallback localStorage system  
5. **Order Management**: Create, view, and manage orders
6. **User Profile**: Update profile information and settings
7. **Admin Panel**: System configuration, SMS settings, user privileges
8. **Responsive Design**: Works perfectly on mobile, tablet, and desktop

## localStorage Data Keys (Updated for AgroHub)
The application uses these localStorage keys for offline data:
- `agrohub_token` - Authentication token
- `agrohub_current_user` - Current user data
- `agrohub_orders` - Order history
- `agrohub_sms_config` - SMS configuration
- `agrohub_admin_settings` - Admin settings

## Current Frontend URL
The frontend is running on: **http://localhost:5175/** (updated port)

## Troubleshooting Login Issues

### If Login Fails:
1. **Clear Browser Cache**: 
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Clear localStorage data

2. **Check Credentials**: 
   - Ensure email and password are exactly as listed above
   - Check for extra spaces or capitalization

3. **Browser Console**: 
   - Press `F12` to open developer tools
   - Check Console tab for error messages

4. **Try Demo Button**:
   - Use "Try Demo Account" button for automatic credential filling

### If Page Won't Load:
1. **Check Server Status**: Ensure `npm run dev` is running
2. **Port Issues**: Try different port if 5176 is occupied
3. **Browser Compatibility**: Use Chrome, Firefox, or Edge (latest versions)

## Backend Server Setup (Optional)

### Quick Start:
```bash
# Start both frontend and backend
npm run dev
```

### Manual Backend Start:
```bash
# Navigate to backend folder
cd backend

# Install dependencies (if needed)  
npm install

# Start backend server
npm run temp
# OR
node temp-server.js
```

### Backend URLs:
- **Backend API**: http://localhost:5001/api
- **Frontend**: http://localhost:5175

## To Start Backend Server (Optional)
If you want to use the full backend functionality:

1. **Easy Method**: Double-click `start-fullstack.bat` 
2. **Manual Method**: 
   - Open terminal: `cd backend`
   - Start server: `node temp-server.js` (updated server file)
3. **npm Method**: `npm run dev` (starts both frontend and backend)

## Application Features by User Type

### 🔧 **Admin Users** (`admin@agrohub.com` / `eclefzy@gmail.com`)
- **Dashboard**: Overview of orders, users, and system health
- **Order Management**: View, process, and update all orders
- **User Management**: View and manage all registered users
- **System Settings**: SMS configuration, user privileges
- **Reports**: Analytics and performance metrics
- **Farmer Coordination**: Manage farmer registrations and products

### 👤 **Regular Users** (`demo@agrohub.com`)
- **Product Browsing**: View all available farm products
- **Shopping Cart**: Add items and checkout
- **Order Tracking**: View order history and status
- **Profile Management**: Update personal information
- **Address Book**: Manage delivery addresses
- **Favorites**: Save preferred products

### 👨‍🌾 **Farmers** (`farmer@agrohub.com`)
- **Product Management**: Add, edit, and remove products
- **Inventory Tracking**: Monitor stock levels
- **Order Notifications**: Receive new order alerts
- **Profile Setup**: Farm information and contact details
- **Sales Analytics**: Track performance and earnings

## Security Notes
- All passwords are for **development/testing only**
- In production, use strong, unique passwords
- localStorage data persists until manually cleared
- Admin access should be restricted in production

## Support & Contact
- **Email**: info@agrohubstore.ng
- **Phone**: +234 800 AGROHUB
- **Documentation**: Check README.md for technical details

---
**Last Updated**: January 2025 - AgroHub v2.0
