const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

// Admin user details
const adminUser = {
  name: "Admin User",
  email: "admin@agrohub.com",
  password: "Admin@123", // Change this to your preferred password
  phone: "+2348012345678",
  address: {
    street: "123 Admin Street",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria",
    zipCode: "900001",
  },
  role: "admin",
  isActive: true,
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists with email:", adminUser.email);
      console.log("📧 Email:", existingAdmin.email);
      console.log("👤 Name:", existingAdmin.name);
      console.log("🔑 Role:", existingAdmin.role);
      process.exit(0);
    }

    // Create new admin user
    const admin = await User.create(adminUser);

    console.log("\n✅ Admin user created successfully!");
    console.log("═══════════════════════════════════════");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password:", adminUser.password);
    console.log("👤 Name:", admin.name);
    console.log("📱 Phone:", admin.phone);
    console.log("🏢 Role:", admin.role);
    console.log("═══════════════════════════════════════");
    console.log(
      "\n⚠️  IMPORTANT: Please change your password after first login!"
    );
    console.log("💡 You can now login with these credentials\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
};

createAdmin();
