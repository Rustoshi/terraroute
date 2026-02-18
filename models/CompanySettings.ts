import mongoose, { Schema, Document } from "mongoose";

export interface ICompanySettings extends Document {
  companyName: string;
  officeAddress: string;
  phone: string;
  email: string;
  website?: string;
  updatedAt: Date;
  createdAt: Date;
}

const CompanySettingsSchema = new Schema<ICompanySettings>(
  {
    companyName: {
      type: String,
      default: "Courier Express",
    },
    officeAddress: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
CompanySettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export const CompanySettings =
  mongoose.models.CompanySettings ||
  mongoose.model<ICompanySettings>("CompanySettings", CompanySettingsSchema);
