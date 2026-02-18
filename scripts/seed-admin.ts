/**
 * Admin User Seed Script
 *
 * Creates an initial admin user for the platform.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-admin.ts
 *
 * Or add to package.json scripts and run: npm run seed:admin
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is not set");
  process.exit(1);
}

// Define User schema inline to avoid import issues
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "ADMIN" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

interface AdminConfig {
  name: string;
  email: string;
  password: string;
}

// Default admin configuration - CHANGE THESE IN PRODUCTION
const DEFAULT_ADMIN: AdminConfig = {
  name: "Admin User",
  email: "admin@terraroutedelivery.pro",
  password: "@Newpass12", // Change this immediately after first login!
};

async function seedAdmin(config: AdminConfig = DEFAULT_ADMIN): Promise<void> {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: config.email.toLowerCase() });

    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists: ${config.email}`);
      console.log("   To create a new admin, use a different email");
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(config.password, saltRounds);

    // Create admin user
    const admin = await User.create({
      name: config.name,
      email: config.email.toLowerCase(),
      passwordHash,
      role: "ADMIN",
    });

    console.log("✅ Admin user created successfully!");
    console.log("   Name:", admin.name);
    console.log("   Email:", admin.email);
    console.log("");
    console.log("⚠️  IMPORTANT: Change the default password immediately after first login!");
    console.log("");

    await mongoose.disconnect();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Parse command line arguments for custom admin
const args = process.argv.slice(2);
const customConfig: Partial<AdminConfig> = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i]?.replace("--", "");
  const value = args[i + 1];

  if (key && value) {
    if (key === "name" || key === "email" || key === "password") {
      customConfig[key] = value;
    }
  }
}

// Merge with defaults
const finalConfig: AdminConfig = {
  ...DEFAULT_ADMIN,
  ...customConfig,
};

// Run the seed function
seedAdmin(finalConfig);
