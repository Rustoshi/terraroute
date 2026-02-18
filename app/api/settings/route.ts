import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CompanySettings } from "@/models/CompanySettings";

// GET /api/settings - Public endpoint for company settings
export async function GET() {
  try {
    await connectDB();

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
}
