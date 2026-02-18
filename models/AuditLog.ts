import mongoose, { Schema, Model } from "mongoose";
import { Types } from "mongoose";

/**
 * Audit Log model - tracks all significant actions in the system.
 * Essential for compliance, debugging, and security monitoring.
 */

export enum AuditAction {
  // Shipment actions
  SHIPMENT_CREATED = "SHIPMENT_CREATED",
  SHIPMENT_UPDATED = "SHIPMENT_UPDATED",
  SHIPMENT_DELETED = "SHIPMENT_DELETED",
  SHIPMENT_STATUS_CHANGED = "SHIPMENT_STATUS_CHANGED",
  
  // Quote actions
  QUOTE_CREATED = "QUOTE_CREATED",
  QUOTE_RESPONDED = "QUOTE_RESPONDED",
  QUOTE_CONVERTED = "QUOTE_CONVERTED",
  
  // Carrier actions
  CARRIER_CREATED = "CARRIER_CREATED",
  CARRIER_UPDATED = "CARRIER_UPDATED",
  CARRIER_DELETED = "CARRIER_DELETED",
  
  // Payment actions
  PAYMENT_RECORDED = "PAYMENT_RECORDED",
  PAYMENT_UPDATED = "PAYMENT_UPDATED",
  
  // Email actions
  EMAIL_SENT = "EMAIL_SENT",
  EMAIL_FAILED = "EMAIL_FAILED",
  
  // Auth actions
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  USER_LOGIN_FAILED = "USER_LOGIN_FAILED",
  
  // File actions
  FILE_UPLOADED = "FILE_UPLOADED",
  FILE_DELETED = "FILE_DELETED",
}

export interface IAuditLog {
  _id: Types.ObjectId;
  action: AuditAction;
  entityType: string; // e.g., "Shipment", "Quote", "Carrier"
  entityId?: Types.ObjectId;
  userId?: Types.ObjectId;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: [true, "Action is required"],
      index: true,
    },
    entityType: {
      type: String,
      required: [true, "Entity type is required"],
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    previousData: {
      type: Schema.Types.Mixed,
    },
    newData: {
      type: Schema.Types.Mixed,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for efficient querying
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;

// ============================================================================
// Helper Functions
// ============================================================================

interface LogAuditParams {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Create an audit log entry.
 * This is a fire-and-forget operation - errors are logged but don't throw.
 */
export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await AuditLog.create({
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ? new Types.ObjectId(params.entityId) : undefined,
      userId: params.userId ? new Types.ObjectId(params.userId) : undefined,
      userEmail: params.userEmail,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      previousData: params.previousData,
      newData: params.newData,
      metadata: params.metadata,
    });
  } catch (error) {
    // Log error but don't throw - audit logging should never break the main flow
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Get IP address from request headers.
 */
export function getClientIP(headers: Headers): string | undefined {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headers.get("x-real-ip") || undefined;
}

/**
 * Get user agent from request headers.
 */
export function getUserAgent(headers: Headers): string | undefined {
  return headers.get("user-agent") || undefined;
}
