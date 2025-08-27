# 🌱 AgroHub - Advanced AgriTech E-Commerce Platform

A comprehensive e-commerce platform transforming agriculture in Africa through innovative technology solutions. AgroHub connects farmers directly with customers, providing a seamless marketplace for fresh, locally-sourced agricultural products.

## 🎯 Project Overview

AgroHub addresses the critical gap between farmers and consumers by providing a digital marketplace that empowers farmers to sell their produce online while enabling customers to access fresh farm products directly. The platform supports three main user types: Farmers, Customers, and Administrators.

### 🏪 Core E-Commerce Features

- **🛒 Advanced Shopping Cart** - Enhanced UX with quantity controls and real-time updates
- **👨‍🌾 Farmer Dashboard** - Complete product and inventory management
- **👥 Customer Portal** - Intuitive browsing, ordering, and tracking system
- **📋 Order Management** - Full lifecycle order processing and status tracking
- **💰 Nigerian Pricing** - All transactions in Nigerian Naira (₦)
- **📱 Mobile-First Design** - Optimized for rural smartphone usage
- **🔐 Secure Authentication** - Multi-role authentication with localStorage fallback

### Key Focus Areas

- **🚜 Farming Efficiency** - Tools and systems for optimized agricultural operations
- **📈 Market Access & Information** - Platforms connecting farmers to markets and pricing data
- **🌿 Sustainable Agriculture** - Solutions promoting environmentally friendly farming practices
- **🌡️ Climate Resilience** - Technologies helping farmers adapt to climate change
- **📊 Agri-Data Analytics** - Data-driven insights for better farming decisions
- **📡 Connectivity & Rural Access** - Solutions improving internet and mobile access in rural areas
- **🐄 Crop & Livestock Management** - Tools for monitoring and managing agricultural assets
- **🍽️ Food Security & Nutrition** - Systems ensuring food availability and nutritional quality
- **📚 Agri-Education & Extension Services** - Platforms for agricultural knowledge sharing

## 🛠️ Technology Stack

### Frontend
- **React 18** with Hooks and modern functional components
- **Vite** for lightning-fast development and optimized builds
- **Bootstrap 5** with React Bootstrap components
- **Modern JavaScript (ES6+)** with clean, maintainable code
- **Font Awesome 6** for comprehensive iconography

### Backend (Optional)
- **Node.js** with Express.js framework
- **MongoDB Atlas** with localStorage fallback
- **RESTful API** architecture
- **CORS-enabled** cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/your-username/AgriTech.git
cd AgriTech

# Install dependencies
npm install

# Start development server (Frontend + Backend)
npm run dev

# Or start individually
npm run frontend  # Frontend only (http://localhost:5173/agrohub/)
npm run backend   # Backend only (http://localhost:5001)
```

### 📱 User Access & Demo Accounts

#### Customer Access
- **URL**: http://localhost:5173/agrohub/
- **Demo Account**: 
  - Email: `customer@agrohub.com`
  - Password: `customer123`

#### Admin Access
- **URL**: http://localhost:5173/agrohub/ (login and auto-redirect)
- **Admin Account**: 
  - Email: `admin@agrohub.com` or `eclefzy@gmail.com`
  - Password: `admin123`

#### Features Available
- **Shopping Cart**: Add products, modify quantities, checkout
- **User Dashboard**: Order history, profile management
- **Admin Panel**: User management, order tracking, reports
- **Product Catalog**: Browse and filter agricultural products
- **Authentication**: Secure login/register system

## 🏗️ Production Deployment

### Environment Configuration

#### Frontend Environment Variables
```env
# .env.production
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=AgriTech
VITE_ENVIRONMENT=production
```

#### Backend Environment Variables
```env
# backend/.env.production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-chars
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://your-frontend-domain.com
ADMIN_EMAIL=your-admin@email.com
```

### Build & Deploy

#### 1. Build for Production
```bash
# Build frontend
npm run build
# Output: /dist/ folder

# Preview production build
npm run preview
```

#### 2. Recommended Hosting

**Frontend Deployment (Static):**
- **Vercel** (Recommended) - Automatic SSL, custom domains
- **Netlify** - Easy deployment, environment variables
- **GitHub Pages** - Free hosting for public repos

**Backend Deployment (Node.js):**
- **Railway** (Recommended) - Node.js optimized, automatic HTTPS
- **Render** - Free tier available, easy MongoDB integration
- **Heroku** - Established platform, add-on ecosystem

#### 3. Domain & SSL Configuration

**Automatic SSL**: All recommended hosting providers include free SSL certificates

**Custom Domain Setup**:
```bash
# DNS Configuration
A Record: @ → Frontend hosting IP
CNAME: api → Backend hosting URL

# Update environment variables
VITE_API_URL=https://api.your-domain.com/api
FRONTEND_URL=https://your-domain.com
```

## 🗂️ Project Structure

```
AgriTech/
├── 📁 src/                    # Frontend source code
│   ├── components/           # React components (18 clean components)
│   ├── services/            # API services and utilities
│   └── assets/              # Images, styles, static files
├── 📁 backend/               # Backend source code
│   ├── models/              # MongoDB/Database models
│   ├── routes/              # API routes and endpoints
│   ├── middleware/          # Custom middleware
│   ├── services/            # Business logic services
│   └── utils/               # Utility functions
├── 📁 public/                # Static assets
├── 📄 package.json          # Dependencies and scripts
├── 📄 vite.config.js        # Build configuration
├── 📄 .env.development      # Development environment
├── 📄 .env.production       # Production environment template
└── 📄 README.md             # This file
```

## 🧪 Testing & Quality Assurance

### Available Test Scripts
```bash
# Backend tests
cd backend
npm run test              # MongoDB connection test
npm run test:health       # Health check endpoints
npm run test:integration  # Full API integration tests

# Database seeding
npm run seed              # Populate with sample data
```

### Code Quality
- **✅ ESLint** configured for code linting
- **✅ Clean Architecture** with separation of concerns
- **✅ Error Handling** comprehensive error management
- **✅ Security** JWT authentication, input validation
- **✅ Performance** optimized builds and lazy loading

## 📊 Features & Functionality

### Customer Features
- **Product Browsing** - Filter and search agricultural products
- **Shopping Cart** - Add, modify quantities, remove items
- **User Registration** - Create account with email verification
- **Order Tracking** - Real-time order status and history
- **Profile Management** - Update personal information and preferences

### Farmer Features
- **Product Management** - Add, edit, and manage product listings
- **Inventory Tracking** - Monitor stock levels and availability
- **Order Fulfillment** - Process and update order statuses
- **Sales Analytics** - Track performance and revenue metrics

### Admin Features
- **User Management** - Manage customer and farmer accounts
- **Order Administration** - Oversee all platform orders
- **Product Moderation** - Approve and manage product listings
- **Platform Analytics** - Comprehensive reporting and insights
- **System Configuration** - Platform settings and customization

## 🤝 Contributing

We welcome contributions to AgroHub! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Use React functional components with hooks
- Implement responsive design using Bootstrap classes
- Follow semantic HTML for accessibility
- Write clean, commented code
- Test functionality before submitting PRs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AgriTech Community** for inspiration and feedback
- **Open Source Contributors** for tools and libraries
- **African Farmers** who inspire our mission
- **React & Vite Teams** for excellent development tools

## 📞 Support

For support, questions, or collaboration:
- **Email**: eclefzy@gmail.com
- **GitHub Issues**: [Create an Issue](https://github.com/your-username/AgriTech/issues)
- **Documentation**: This README and inline code comments

---

**🌱 Built with ❤️ for African Agriculture** 

*Empowering farmers, connecting communities, transforming agriculture through technology.*
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd AgriTech
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Access the application:**
   - Open browser to: **http://localhost:5175/**
   - Use demo credentials from LOGIN_INSTRUCTIONS.md

## 🔑 User Authentication

### Test Accounts (Ready to Use)

#### 🚀 **Demo Account** (Recommended)
- **Email**: `demo@agrohub.com`
- **Password**: `demo123`
- **Access**: Full customer features, shopping cart, orders

#### 🔧 **Admin Account**
- **Email**: `admin@agrohub.com`
- **Password**: `password`
- **Access**: Full admin dashboard, user management, analytics

#### 👨‍🌾 **Farmer Account**
- **Email**: `farmer@agrohub.com`
- **Password**: `farmer123`
- **Access**: Product management, inventory, farmer dashboard

*For complete login instructions, see `LOGIN_INSTRUCTIONS.md`*

## 📱 Platform Features

### 🛒 Enhanced Shopping Cart
- **Modern Design** - Clean, intuitive interface with Bootstrap styling
- **Quantity Controls** - Smart +/- buttons with stock validation
- **Real-time Updates** - Order summary updates instantly with quantity changes
- **Privacy-Focused** - No sensitive stock information exposed to customers
- **Mobile Optimized** - Touch-friendly controls for mobile devices

### 📋 Advanced Order Management
- **Status Tracking** - Real-time order status (Pending, Processing, Shipped, Delivered)
- **Customer Dashboard** - Complete order history and tracking
- **Admin Panel** - Comprehensive order oversight and management
- **Automated Updates** - Status changes trigger notifications
- **Revenue Analytics** - Sales tracking and performance metrics

### 👥 Multi-Role User System
- **Customer Profiles** - Purchase history, delivery addresses, preferences
- **Farmer Profiles** - Farm details, product listings, sales analytics
- **Admin Profiles** - System management, user oversight, platform analytics

### 📊 Business Intelligence
- **Sales Analytics** - Revenue tracking and trend analysis
- **Inventory Management** - Stock levels and product performance
- **User Analytics** - Registration, engagement, and retention metrics
- **Order Insights** - Processing times, delivery performance, customer satisfaction

## 🎨 Design Philosophy

### User Experience
- **Mobile-First Approach** - Designed for smartphone users in rural areas
- **High Contrast UI** - Optimized for outdoor visibility
- **Large Touch Targets** - Easy interaction on mobile devices
- **Intuitive Navigation** - Clear user flow and logical information architecture

### Accessibility & Inclusion
- **Semantic HTML** - Screen reader compatible
- **Keyboard Navigation** - Full keyboard accessibility
- **Color Contrast** - WCAG 2.1 AA compliance
- **Responsive Design** - Works on all device sizes

## 💰 Sample Product Catalog

AgroHub features a diverse range of farm products with Nigerian pricing:

| Product | Price | Unit | Region | Stock Status |
|---------|-------|------|--------|--------------|
| Fresh Tomatoes | ₦2,500 | kg | Lagos State | In Stock |
| White Rice | ₦1,200 | kg | Plateau State | In Stock |
| Yellow Maize | ₦800 | kg | Kano State | Limited Stock |
| Sweet Potatoes | ₦1,800 | kg | Plateau State | In Stock |
| Fresh Pepper | ₦3,500 | kg | Ogun State | In Stock |
| Plantains | ₦1,500 | kg | Cross River | In Stock |
| Garden Eggs | ₦2,200 | kg | Enugu State | In Stock |
| Groundnuts | ₦2,800 | kg | Kaduna State | Limited Stock |
| Fresh Okra | ₦1,800 | kg | Kwara State | In Stock |
| Coconuts | ₦500 | piece | Lagos State | In Stock |

## 📂 Project Architecture

```
AgroHub/
├── src/
│   ├── components/          # React components
│   │   ├── AboutPage.jsx       # About page content
│   │   ├── AdminDashboard.jsx  # Admin control panel
│   │   ├── AdminNavbar.jsx     # Admin navigation bar
│   │   ├── AdminOrders.jsx     # Admin order management
│   │   ├── AdminProfile.jsx    # Admin profile management
│   │   ├── AdminReports.jsx    # Admin reports and analytics
│   │   ├── AuthModal.jsx       # Authentication modal
│   │   ├── ContactPage.jsx     # Contact page content
│   │   ├── FarmProducts.jsx    # Product marketplace
│   │   ├── LandingPage.jsx     # Homepage component
│   │   ├── NavigationHeader.jsx # Main navigation header
│   │   ├── ScrollToTop.jsx     # Scroll to top button
│   │   ├── ShoppingCart.jsx    # Enhanced shopping cart
│   │   ├── UserDashboard.jsx   # User dashboard
│   │   ├── UserManagement.jsx  # Admin user management
│   │   ├── UserNotification.jsx # Toast notifications
│   │   ├── UserOrdersPage.jsx  # User order history
│   │   └── UserSettings.jsx    # User profile settings
│   ├── services/            # API services
│   │   └── api.js              # API endpoints and calls
│   ├── App.jsx              # Main application
│   ├── App.css              # Global styles
│   └── main.jsx             # Entry point
├── backend/                 # Backend server (optional)
│   ├── temp-server.js          # Development server
│   └── package.json            # Backend dependencies
├── public/                  # Static assets
├── LOGIN_INSTRUCTIONS.md    # Comprehensive login guide
├── README.md               # This file
├── package.json            # Project dependencies
└── vite.config.js          # Vite configuration
```

## 🎯 Target Users & Use Cases

### 👨‍🌾 **Farmers**
- List and manage agricultural products
- Set pricing and update inventory
- Process customer orders efficiently
- Track sales performance and revenue
- Manage delivery schedules and logistics

### 👥 **Customers**
- Browse fresh farm products by category
- Add items to cart with quantity selection
- Secure checkout and order placement
- Track order status and delivery updates
- Access purchase history and reorder

### 👨‍💻 **Administrators**
- Oversee platform operations and health
- Manage user accounts and verification
- Monitor order processing and fulfillment
- Generate business analytics and reports
- Handle customer support and disputes

## 🔧 Development Features

### Code Quality
- **Modern React Patterns** - Hooks, functional components, context
- **Component Reusability** - Modular, maintainable component structure
- **Error Handling** - Comprehensive error boundaries and fallbacks
- **Performance Optimized** - Code splitting and lazy loading
- **TypeScript Ready** - Easy migration path to TypeScript

### Developer Experience
- **Hot Module Replacement** - Instant development feedback
- **ESLint Configuration** - Code quality and consistency
- **Vite Build System** - Lightning-fast builds and development
- **Development Server** - Auto-restart and live reload
- **Clear Documentation** - Comprehensive setup and usage guides

## 📊 Available Scripts

```bash
npm run dev        # Start development server (frontend + backend)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint code quality checks
```

## 🌍 Deployment & Production

### Production Readiness
- **Optimized Builds** - Minified, tree-shaken production bundles
- **Environment Configuration** - Separate dev/staging/production configs
- **Security Headers** - CORS, CSP, and security best practices
- **Performance Monitoring** - Built-in analytics and error tracking

### Deployment Options
- **Vercel** - Zero-config deployment with GitHub integration
- **Netlify** - JAMstack deployment with form handling
- **AWS S3 + CloudFront** - Scalable cloud deployment
- **Traditional Hosting** - Apache/Nginx with static files

## 🤝 Contributing & Development

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper testing
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Submit a Pull Request

### Development Guidelines
- Follow React best practices and hooks patterns
- Maintain Bootstrap component consistency
- Add proper error handling and loading states
- Update documentation for new features
- Test on multiple devices and browsers

## 🏆 Project Achievements

### Technical Excellence
- ✅ **Fully Functional E-commerce Platform** with cart, orders, and payments
- ✅ **Multi-Role Authentication System** with secure user management
- ✅ **Responsive Design** optimized for mobile and desktop
- ✅ **Real-time Updates** with state management and localStorage persistence
- ✅ **Admin Dashboard** with comprehensive business intelligence

### User Experience
- ✅ **Intuitive Interface** with modern, clean design
- ✅ **Fast Performance** with optimized React and Vite
- ✅ **Accessibility Compliant** with semantic HTML and ARIA
- ✅ **Mobile-First Design** perfect for rural smartphone users
- ✅ **Offline Capability** with localStorage fallback systems

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 💡 Support & Documentation

- **Login Instructions**: See `LOGIN_INSTRUCTIONS.md` for complete setup guide
- **API Documentation**: Check `/backend` folder for API endpoints
- **Component Documentation**: Inline comments and JSDoc in source files
- **Troubleshooting**: Common issues and solutions in login instructions

---

**Built with ❤️ for African agriculture** - Transforming farming through innovative technology solutions.

*AgroHub v2.0 - Empowering farmers, connecting communities, feeding the future.*
