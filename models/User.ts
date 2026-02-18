import mongoose, { Schema, Model } from "mongoose";
import { IUser, UserRole } from "@/types";

/**
 * User model for admin authentication.
 * Only admin users are stored - public users don't have accounts.
 */

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.ADMIN,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: email index is created automatically by unique: true on the field

// Prevent returning password hash in queries by default
UserSchema.set("toJSON", {
  transform: function (_, ret) {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.passwordHash;
    return obj;
  },
});

// Check if model exists to prevent overwrite during hot reloads
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
