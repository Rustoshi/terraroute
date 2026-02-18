import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CompanySettings } from "@/models/CompanySettings";
import { withAuth, AuthenticatedHandler } from "@/middleware/withAuth";
import { z } from "zod";

const updateSettingsSchema = z.object({
  companyName: z.string().min(1).optional(),
  officeAddress: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

// GET /api/admin/settings - Get company settings
const handleGet: AuthenticatedHandler = async () => {
  try {
    await connectDB();

    // Get or create settings
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({});
    }

    return NextResponse.json({
      success: true,
      data: {
        companyName: settings.companyName,
        officeAddress: settings.officeAddress,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
      },
    });
  } catch (error) {
    console.error("Error fetching company settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
};

// PUT /api/admin/settings - Update company settings
const handlePut: AuthenticatedHandler = async (request) => {
  try {
    const body = await request.json();
    const validationResult = updateSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    // Get or create settings, then update
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create(validationResult.data);
    } else {
      Object.assign(settings, validationResult.data);
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        companyName: settings.companyName,
        officeAddress: settings.officeAddress,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
      },
    });
  } catch (error) {
    console.error("Error updating company settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
};

export const GET = withAuth(handleGet);
export const PUT = withAuth(handlePut);
