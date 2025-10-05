const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Farmer = require("../models/Farmer");
const { protect, isAdmin } = require("../middleware/auth");
const AfricasTalking = require("africastalking");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get("/dashboard", async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "user" }),
      Order.countDocuments(),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Processing" }),
      Order.countDocuments({ status: "Delivered" }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Farmer.countDocuments(),
      Farmer.countDocuments({ isVerified: true }),
    ]);

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ["Delivered", "Processing", "Shipped"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .populate("farmer", "farmName")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers: stats[0],
          totalAdmins: stats[1],
          totalFarmers: stats[10],
          totalCustomers: stats[3],
          totalOrders: stats[4],
          pendingOrders: stats[5],
          processingOrders: stats[6],
          deliveredOrders: stats[7],
          totalProducts: stats[8],
          activeProducts: stats[9],
          verifiedFarmers: stats[11],
          totalRevenue,
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get("/orders", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .populate("farmer", "farmName user")
      .populate({
        path: "farmer",
        populate: { path: "user", select: "name phone" },
      })
      .populate("product", "name category")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided",
      });
    }

    const order = await Order.findById(req.params.id)
      .populate("farmer")
      .populate({
        path: "farmer",
        populate: { path: "user", select: "name phone" },
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order status
    order.status = status;
    if (note) {
      order.notes.adminNotes = note;
    }

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note,
      updatedBy: req.user._id,
    });

    await order.save();

    // Send SMS notification to farmer if status is Processing
    if (status === "Processing" && order.farmer && order.farmer.user) {
      try {
        await sendSmsToFarmer(order);
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
        // Don't fail the whole request if SMS fails
      }
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const role = req.query.role;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    if (role && role !== "all") {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
router.put("/users/:id/toggle-status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't allow deactivation of admin users
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot deactivate admin users",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: error.message,
    });
  }
});

// @desc    Get all farmers
// @route   GET /api/admin/farmers
// @access  Private/Admin
router.get("/farmers", async (req, res) => {
  try {
    const farmers = await Farmer.find()
      .populate("user", "name email phone isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: farmers.length,
      data: farmers,
    });
  } catch (error) {
    console.error("Get farmers error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching farmers",
      error: error.message,
    });
  }
});

// @desc    Create new farmer
// @route   POST /api/admin/farmers
// @access  Private/Admin
router.post("/farmers", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      farmName,
      location,
      specializations,
      farmingExperience,
      isVerified = false,
    } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !farmName) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, email, password, phone, farmName",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user account for farmer
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "farmer",
      isActive: true,
    });

    // Create farmer profile
    const farmerData = {
      user: user._id,
      farmName,
      specializations: specializations || ["Crop Farming"],
      isVerified,
      isActive: true,
    };

    if (location) {
      farmerData.location = location;
    }

    if (farmingExperience) {
      farmerData.farmingExperience = farmingExperience;
    }

    const farmer = await Farmer.create(farmerData);

    // Populate user data before sending response
    await farmer.populate("user", "name email phone isActive");

    res.status(201).json({
      success: true,
      message: "Farmer created successfully",
      data: farmer,
    });
  } catch (error) {
    console.error("Create farmer error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating farmer",
      error: error.message,
    });
  }
});

// @desc    Update farmer
// @route   PUT /api/admin/farmers/:id
// @access  Private/Admin
router.put("/farmers/:id", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      farmName,
      location,
      specializations,
      farmingExperience,
      isActive,
    } = req.body;

    // Find farmer
    const farmer = await Farmer.findById(req.params.id).populate("user");
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    // Update user data if provided
    if (name || email || phone) {
      const userUpdateData = {};
      if (name) userUpdateData.name = name;
      if (email) {
        // Check if email is being changed and if it already exists
        if (email !== farmer.user.email) {
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            return res.status(400).json({
              success: false,
              message: "Email already exists",
            });
          }
        }
        userUpdateData.email = email;
      }
      if (phone) userUpdateData.phone = phone;

      await User.findByIdAndUpdate(farmer.user._id, userUpdateData, {
        new: true,
        runValidators: true,
      });
    }

    // Update farmer data
    const farmerUpdateData = {};
    if (farmName) farmerUpdateData.farmName = farmName;
    if (location) farmerUpdateData.location = location;
    if (specializations) farmerUpdateData.specializations = specializations;
    if (farmingExperience)
      farmerUpdateData.farmingExperience = farmingExperience;
    if (typeof isActive === "boolean") farmerUpdateData.isActive = isActive;

    const updatedFarmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      farmerUpdateData,
      { new: true, runValidators: true }
    ).populate("user", "name email phone isActive");

    res.status(200).json({
      success: true,
      message: "Farmer updated successfully",
      data: updatedFarmer,
    });
  } catch (error) {
    console.error("Update farmer error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating farmer",
      error: error.message,
    });
  }
});

// @desc    Delete farmer
// @route   DELETE /api/admin/farmers/:id
// @access  Private/Admin
router.delete("/farmers/:id", async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    // Check if farmer has products
    const farmerProducts = await Product.countDocuments({
      farmer: req.params.id,
    });

    if (farmerProducts > 0) {
      // Deactivate farmer instead of deleting
      farmer.isActive = false;
      await farmer.save();

      return res.status(200).json({
        success: true,
        message: "Farmer deactivated successfully (has existing products)",
        data: { deactivated: true },
      });
    }

    // Delete farmer and associated user account
    await User.findByIdAndDelete(farmer.user);
    await Farmer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Farmer deleted successfully",
      data: { deleted: true },
    });
  } catch (error) {
    console.error("Delete farmer error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting farmer",
      error: error.message,
    });
  }
});

// =====================
// PRODUCT MANAGEMENT ROUTES
// =====================

// @desc    Get all products (admin view)
// @route   GET /api/admin/products
// @access  Private/Admin
router.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const category = req.query.category;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    if (category && category !== "all") {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate({
        path: "farmer",
        populate: { path: "user", select: "name phone" },
        select: "farmName location user",
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private/Admin
router.post("/products", async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      farmer,
      price,
      unit,
      stock,
      emoji,
      organic,
      grade,
      harvestDate,
      expiryDate,
    } = req.body;

    // Validation
    if (!name || !description || !category || !farmer || !price || !unit) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, description, category, farmer, price, unit",
      });
    }

    // Verify farmer exists
    const farmerDoc = await Farmer.findById(farmer);
    if (!farmerDoc) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    // Create product
    const productData = {
      name,
      description,
      category,
      farmer,
      pricing: {
        basePrice: price,
        unit: unit || "kg",
      },
      inventory: {
        available: stock || 0,
        unit: unit || "kg",
      },
      emoji: emoji || "🌱",
      quality: {
        organic: organic || false,
        grade: grade || "A",
      },
    };

    if (harvestDate) {
      productData.inventory.harvestDate = harvestDate;
    }

    if (expiryDate) {
      productData.inventory.expiryDate = expiryDate;
    }

    const product = await Product.create(productData);

    // Populate farmer data before sending response
    await product.populate({
      path: "farmer",
      populate: { path: "user", select: "name phone" },
      select: "farmName location user",
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
router.put("/products/:id", async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      unit,
      stock,
      emoji,
      organic,
      grade,
      isActive,
      isFeatured,
      harvestDate,
      expiryDate,
    } = req.body;

    // Find product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update product data
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price) product.pricing.basePrice = price;
    if (unit) {
      product.pricing.unit = unit;
      product.inventory.unit = unit;
    }
    if (typeof stock === "number") product.inventory.available = stock;
    if (emoji) product.emoji = emoji;
    if (typeof organic === "boolean") product.quality.organic = organic;
    if (grade) product.quality.grade = grade;
    if (typeof isActive === "boolean") product.isActive = isActive;
    if (typeof isFeatured === "boolean") product.isFeatured = isFeatured;
    if (harvestDate) product.inventory.harvestDate = harvestDate;
    if (expiryDate) product.inventory.expiryDate = expiryDate;

    await product.save();

    // Populate farmer data
    await product.populate({
      path: "farmer",
      populate: { path: "user", select: "name phone" },
      select: "farmName location user",
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product has orders
    const productOrders = await Order.countDocuments({
      product: req.params.id,
    });

    if (productOrders > 0) {
      // Deactivate product instead of deleting
      product.isActive = false;
      await product.save();

      return res.status(200).json({
        success: true,
        message: "Product deactivated successfully (has existing orders)",
        data: { deactivated: true },
      });
    }

    // Delete product
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: { deleted: true },
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
});

// @desc    Verify/Reject farmer with detailed feedback
// @route   PUT /api/admin/farmers/:id/verify
// @access  Private/Admin
router.put("/farmers/:id/verify", async (req, res) => {
  try {
    const { isVerified, rejectionReason, requiredDocuments, adminNotes } =
      req.body;

    const farmer = await Farmer.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    // Update farmer verification status
    farmer.isVerified = isVerified;
    farmer.verificationDate = isVerified ? new Date() : null;

    // If rejected, store rejection details
    if (!isVerified) {
      farmer.rejectionDetails = {
        reason: rejectionReason || "General rejection",
        requiredDocuments: requiredDocuments || [],
        adminNotes: adminNotes || "",
        rejectedAt: new Date(),
        rejectedBy: req.user._id,
      };
    } else {
      // Clear rejection details if approved
      farmer.rejectionDetails = undefined;
    }

    await farmer.save();

    // Send email notification
    try {
      const emailService = require("../services/emailService");

      if (isVerified) {
        await emailService.sendFarmerApprovalEmail(farmer.user.email, {
          farmerName: farmer.user.name,
          farmName: farmer.farmName,
          approvalDate: new Date().toLocaleDateString(),
        });
        console.log(`✅ Approval email sent to: ${farmer.user.email}`);
      } else {
        await emailService.sendFarmerRejectionEmail(farmer.user.email, {
          farmerName: farmer.user.name,
          farmName: farmer.farmName,
          rejectionReason: rejectionReason || "General rejection",
          requiredDocuments: requiredDocuments || [],
          adminNotes: adminNotes || "",
          rejectionDate: new Date().toLocaleDateString(),
        });
        console.log(`📧 Rejection email sent to: ${farmer.user.email}`);
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Don't fail the verification process if email fails
    }

    console.log(
      `${isVerified ? "✅ Verified" : "❌ Rejected"} farmer: ${
        farmer.farmName
      } (${farmer.user?.email})`
    );

    res.status(200).json({
      success: true,
      message: `Farmer ${isVerified ? "verified" : "rejected"} successfully`,
      data: farmer,
    });
  } catch (error) {
    console.error("Farmer verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating farmer verification",
      error: error.message,
    });
  }
});

// @desc    Send SMS to farmer
// @route   POST /api/admin/sms/farmer
// @access  Private/Admin
router.post("/sms/farmer", async (req, res) => {
  try {
    const { message, phone } = req.body;

    if (!message || !phone) {
      return res.status(400).json({
        success: false,
        message: "Message and phone number are required",
      });
    }

    const result = await sendSms(phone, message);

    res.status(200).json({
      success: true,
      message: "SMS sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Send SMS error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending SMS",
      error: error.message,
    });
  }
});

// Helper function to send SMS to farmer
const sendSmsToFarmer = async (order) => {
  try {
    if (
      !process.env.AFRICASTALKING_API_KEY ||
      !process.env.AFRICASTALKING_USERNAME
    ) {
      console.log("⚠️ SMS not configured - skipping farmer notification");
      return;
    }

    const message = `🌾 AgriTech Order Alert!
New order received:
Product: ${order.orderDetails.productName}
Quantity: ${order.orderDetails.quantity} ${order.orderDetails.unit}
Customer: ${order.customerInfo.name}
Phone: ${order.customerInfo.phone}
Delivery: ${order.customerInfo.deliveryAddress.city}, ${order.customerInfo.deliveryAddress.state}
Order ID: #${order.orderNumber}
Please prepare for delivery. Thank you!`;

    const phone = order.farmer.user.phone;
    await sendSms(phone, message);

    // Update order with SMS notification
    order.addSmsNotification("farmer", phone, message);
    await order.save();

    console.log(`✅ SMS sent to farmer: ${phone}`);
  } catch (error) {
    console.error("❌ Failed to send SMS to farmer:", error);
    throw error;
  }
};

// Helper function to send SMS
const sendSms = async (phone, message) => {
  try {
    const africastalking = AfricasTalking({
      apiKey: process.env.AFRICASTALKING_API_KEY,
      username: process.env.AFRICASTALKING_USERNAME,
    });

    const sms = africastalking.SMS;

    const result = await sms.send({
      to: phone,
      message: message,
      from: "AgriTech",
    });

    return result;
  } catch (error) {
    console.error("SMS sending error:", error);
    throw new Error("Failed to send SMS: " + error.message);
  }
};

// =====================
// USER MANAGEMENT ROUTES
// =====================

// @desc    Get all users with filtering and pagination
// @route   GET /api/admin/users
// @access  Private/Admin
router.get("/users", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (role && role !== "all") {
      filter.role = role;
    }

    if (status && status !== "all") {
      filter.isActive = status === "active";
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Get users with pagination
    const users = await User.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    // Get user statistics
    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ isActive: true }),
      inactive: await User.countDocuments({ isActive: false }),
      admins: await User.countDocuments({ role: "admin" }),
      farmers: await User.countDocuments({ role: "farmer" }),
      users: await User.countDocuments({ role: "user" }),
      newThisMonth: await User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
    };

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
      stats,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
});

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("orders");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
});

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
router.post("/users", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = "user",
      isActive = true,
      address,
    } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, email, password, phone",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      phone,
      role,
      isActive,
    };

    if (address) {
      userData.address = address;
    }

    const user = await User.create(userData);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put("/users/:id", async (req, res) => {
  try {
    const { name, email, phone, role, isActive, address } = req.body;

    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.id && role && role !== user.role) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (address) updateData.address = address;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Check if user has orders - if so, deactivate instead of delete
    const userOrders = await Order.countDocuments({ user: req.params.id });

    if (userOrders > 0) {
      // Deactivate user instead of deleting
      user.isActive = false;
      user.email = `deleted_${Date.now()}_${user.email}`;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "User deactivated successfully (has existing orders)",
        data: { deactivated: true },
      });
    }

    // Delete user if no orders
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: { deleted: true },
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
});

// @desc    Bulk update users
// @route   PATCH /api/admin/users/bulk
// @access  Private/Admin
router.patch("/users/bulk", async (req, res) => {
  try {
    const { userIds, action, value } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid user IDs array",
      });
    }

    let updateData = {};
    let message = "";

    switch (action) {
      case "activate":
        updateData.isActive = true;
        message = "Users activated successfully";
        break;
      case "deactivate":
        updateData.isActive = false;
        message = "Users deactivated successfully";
        break;
      case "changeRole":
        if (!value || !["user", "farmer", "admin"].includes(value)) {
          return res.status(400).json({
            success: false,
            message: "Invalid role provided",
          });
        }
        updateData.role = value;
        message = `Users role changed to ${value} successfully`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action provided",
        });
    }

    // Prevent admin from changing their own status/role
    const filteredUserIds = userIds.filter((id) => id !== req.user.id);

    const result = await User.updateMany(
      { _id: { $in: filteredUserIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
    });
  } catch (error) {
    console.error("Bulk update users error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating users",
      error: error.message,
    });
  }
});

// @desc    Get analytics and reports data
// @route   GET /api/admin/reports
// @access  Private/Admin
router.get("/reports", async (req, res) => {
  try {
    const period = req.query.period || "7days";

    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "3months":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "6months":
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case "1year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get sales data over time
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ["Delivered", "Processing", "Shipped"] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get top products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ["Delivered", "Processing", "Shipped"] },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$product",
          productName: { $first: "$productInfo.name" },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          quantitySold: { $sum: "$quantity" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
    ]);

    // Get farmer performance
    const farmerPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          farmer: { $exists: true },
          status: { $in: ["Delivered", "Processing", "Shipped"] },
        },
      },
      {
        $lookup: {
          from: "farmers",
          localField: "farmer",
          foreignField: "_id",
          as: "farmerInfo",
        },
      },
      { $unwind: "$farmerInfo" },
      {
        $group: {
          _id: "$farmer",
          farmerName: { $first: "$farmerInfo.farmName" },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Calculate summary statistics
    const summaryStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ["$status", ["Delivered", "Processing", "Shipped"]] },
                "$totalAmount",
                0,
              ],
            },
          },
          totalOrders: { $sum: 1 },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] },
          },
        },
      },
    ]);

    const activeCustomers = await User.countDocuments({
      role: "user",
      lastLogin: { $gte: startDate },
    });

    const activeFarmers = await Farmer.countDocuments({
      isVerified: true,
    });

    const stats =
      summaryStats.length > 0
        ? summaryStats[0]
        : {
            totalRevenue: 0,
            totalOrders: 0,
            deliveredOrders: 0,
          };

    const averageOrderValue =
      stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

    const deliverySuccessRate =
      stats.totalOrders > 0
        ? (stats.deliveredOrders / stats.totalOrders) * 100
        : 0;

    // Get recent activity
    const recentActivity = await Order.find({ createdAt: { $gte: startDate } })
      .populate("user", "name")
      .populate("product", "name")
      .populate("farmer", "farmName")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("orderNumber status totalAmount createdAt");

    res.status(200).json({
      success: true,
      data: {
        salesOverTime: salesData,
        ordersByStatus: ordersByStatus,
        topProducts: topProducts,
        farmerPerformance: farmerPerformance.map((f) => ({
          name: f.farmerName,
          orders: f.orders,
          revenue: f.revenue,
          rating: 4.5, // Default rating as we don't have ratings yet
        })),
        summaryStats: {
          totalRevenue: stats.totalRevenue || 0,
          totalOrders: stats.totalOrders || 0,
          activeCustomers: activeCustomers,
          activeFarmers: activeFarmers,
          averageOrderValue: Math.round(averageOrderValue),
          conversionRate: 0, // Placeholder - requires visitor tracking
          customerSatisfaction: 4.5, // Placeholder - requires review system
          deliverySuccessRate: Math.round(deliverySuccessRate * 10) / 10,
        },
        recentActivity: recentActivity,
        period: period,
        dateRange: {
          start: startDate,
          end: now,
        },
      },
    });
  } catch (error) {
    console.error("Reports error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reports data",
      error: error.message,
    });
  }
});

// @desc    Get admin notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
router.get("/notifications", async (req, res) => {
  try {
    const notifications = [];

    // Get recent orders (last 24 hours)
    const recentOrders = await Order.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("product", "name")
      .populate("user", "name");

    recentOrders.forEach((order) => {
      const timeAgo = getTimeAgo(order.createdAt);
      notifications.push({
        id: `order-${order._id}`,
        type: "order",
        message: `New order for ${order.product?.name || "product"} - ₦${
          order.totalAmount
        }`,
        time: timeAgo,
        route: "/admin-orders",
        createdAt: order.createdAt,
      });
    });

    // Get pending farmer registrations
    const pendingFarmers = await Farmer.find({
      isVerified: false,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    pendingFarmers.forEach((farmer) => {
      const timeAgo = getTimeAgo(farmer.createdAt);
      notifications.push({
        id: `farmer-${farmer._id}`,
        type: "farmer",
        message: `Farmer registration pending: ${farmer.farmName}`,
        time: timeAgo,
        route: "/admin-users",
        createdAt: farmer.createdAt,
      });
    });

    // Get low stock products
    const lowStockProducts = await Product.find({
      quantity: { $lte: 10, $gt: 0 },
      isActive: true,
    })
      .sort({ quantity: 1 })
      .limit(3);

    lowStockProducts.forEach((product) => {
      notifications.push({
        id: `stock-${product._id}`,
        type: "stock",
        message: `Low stock: ${product.name} (${product.quantity} ${product.unit} left)`,
        time: "now",
        route: "/admin-products",
        createdAt: new Date(),
      });
    });

    // Sort by created date, most recent first
    notifications.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      data: notifications.slice(0, 10), // Return max 10 notifications
    });
  } catch (error) {
    console.error("Notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
});

// @desc    Get system alerts
// @route   GET /api/admin/alerts
// @access  Private/Admin
router.get("/alerts", async (req, res) => {
  try {
    const alerts = [];

    // Get low stock products
    const lowStockProducts = await Product.find({
      quantity: { $lte: 10, $gt: 0 },
      isActive: true,
    }).sort({ quantity: 1 });

    if (lowStockProducts.length > 0) {
      const productList = lowStockProducts
        .slice(0, 3)
        .map((p) => `${p.name} (${p.quantity} ${p.unit})`)
        .join(", ");
      alerts.push({
        type: "warning",
        icon: "⚠️",
        message: `Low Stock: ${productList}`,
        count: lowStockProducts.length,
        route: "/admin-products",
      });
    }

    // Get pending farmer verifications
    const pendingFarmersCount = await Farmer.countDocuments({
      isVerified: false,
    });

    if (pendingFarmersCount > 0) {
      alerts.push({
        type: "info",
        icon: "👨‍🌾",
        message: `New Farmer: Pending verification (${pendingFarmersCount})`,
        count: pendingFarmersCount,
        route: "/admin-users",
      });
    }

    // Get pending orders
    const pendingOrdersCount = await Order.countDocuments({
      status: "Pending",
    });

    if (pendingOrdersCount > 0) {
      alerts.push({
        type: "primary",
        icon: "📦",
        message: `Orders: ${pendingOrdersCount} pending orders`,
        count: pendingOrdersCount,
        route: "/admin-orders",
      });
    }

    // Get out of stock products
    const outOfStockCount = await Product.countDocuments({
      quantity: 0,
      isActive: true,
    });

    if (outOfStockCount > 0) {
      alerts.push({
        type: "danger",
        icon: "❌",
        message: `Out of Stock: ${outOfStockCount} products unavailable`,
        count: outOfStockCount,
        route: "/admin-products",
      });
    }

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Alerts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching alerts",
      error: error.message,
    });
  }
});

// @desc    Get top selling products
// @route   GET /api/admin/top-products
// @access  Private/Admin
router.get("/top-products", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Aggregate orders to find top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Delivered", "Processing", "Shipped"] },
        },
      },
      {
        $group: {
          _id: "$product",
          totalSold: { $sum: "$quantity" },
          revenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          name: "$productDetails.name",
          totalSold: 1,
          revenue: 1,
          orderCount: 1,
          unit: "$productDetails.unit",
          category: "$productDetails.category",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    console.error("Top products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top products",
      error: error.message,
    });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1)
    return interval + " year" + (interval > 1 ? "s" : "") + " ago";

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1)
    return interval + " month" + (interval > 1 ? "s" : "") + " ago";

  interval = Math.floor(seconds / 86400);
  if (interval >= 1)
    return interval + " day" + (interval > 1 ? "s" : "") + " ago";

  interval = Math.floor(seconds / 3600);
  if (interval >= 1)
    return interval + " hour" + (interval > 1 ? "s" : "") + " ago";

  interval = Math.floor(seconds / 60);
  if (interval >= 1)
    return interval + " min" + (interval > 1 ? "s" : "") + " ago";

  return "just now";
}

module.exports = router;
