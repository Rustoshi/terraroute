import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Shipment from "@/models/Shipment";
import { withAuth, AuthenticatedHandler } from "@/middleware/withAuth";
import { validateData, uploadRequestSchema } from "@/utils/validation";
import { generateUploadSignature, uploadFile, getUploadConstraints } from "@/lib/cloudinary";
import { ApiResponse } from "@/types";
import { Types } from "mongoose";

/**
 * POST /api/admin/uploads
 *
 * Generate a signed upload URL for Cloudinary (Admin only).
 * Can optionally attach the upload to a shipment.
 *
 * For direct file upload, send file as base64 in request body.
 * For client-side upload, request a signature and upload directly to Cloudinary.
 */
const handlePost: AuthenticatedHandler = async (request, context) => {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle JSON request (signature generation or base64 upload)
    if (contentType.includes("application/json")) {
      const body = await request.json();

      // Validate upload request
      const validation = validateData(uploadRequestSchema, body);
      if (!validation.success) {
        const response: ApiResponse = {
          success: false,
          error: validation.error,
        };
        return NextResponse.json(response, { status: 400 });
      }

      const { shipmentId, filename } = validation.data!;

      // If file data is provided, upload directly
      if (body.file) {
        const uploadResult = await uploadFile(body.file, "package_images", filename);

        if (!uploadResult.success) {
          const response: ApiResponse = {
            success: false,
            error: uploadResult.error || "Upload failed",
          };
          return NextResponse.json(response, { status: 500 });
        }

        // If shipmentId provided, attach to shipment as package image
        if (shipmentId && Types.ObjectId.isValid(shipmentId)) {
          await connectDB();

          const packageImage = {
            url: uploadResult.url!,
            publicId: uploadResult.publicId!,
            uploadedAt: new Date(),
          };

          await Shipment.findByIdAndUpdate(shipmentId, {
            $push: { packageImages: packageImage },
          });
        }

        const response: ApiResponse<{
          url: string;
          publicId: string;
        }> = {
          success: true,
          data: {
            url: uploadResult.url!,
            publicId: uploadResult.publicId!,
          },
          message: "File uploaded successfully",
        };

        return NextResponse.json(response, { status: 201 });
      }

      // Otherwise, generate signature for client-side upload
      const signature = generateUploadSignature("package_images");
      const constraints = getUploadConstraints("package_images");

      const response: ApiResponse<{
        signature: string;
        timestamp: number;
        cloudName: string;
        apiKey: string;
        folder: string;
        constraints: {
          allowedFormats: string[];
          maxBytes: number;
        };
      }> = {
        success: true,
        data: {
          signature: signature.signature,
          timestamp: signature.timestamp,
          cloudName: signature.cloudName,
          apiKey: signature.apiKey,
          folder: signature.folder,
          constraints: {
            allowedFormats: [...constraints.allowed_formats],
            maxBytes: constraints.max_bytes,
          },
        },
      };

      return NextResponse.json(response);
    }

    // Handle multipart form data upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const shipmentId = formData.get("shipmentId") as string | null;

      if (!file) {
        const response: ApiResponse = {
          success: false,
          error: "No file provided",
        };
        return NextResponse.json(response, { status: 400 });
      }

      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

      // Upload to Cloudinary
      const uploadResult = await uploadFile(base64, "package_images", file.name);

      if (!uploadResult.success) {
        const response: ApiResponse = {
          success: false,
          error: uploadResult.error || "Upload failed",
        };
        return NextResponse.json(response, { status: 500 });
      }

      // If shipmentId provided, attach to shipment as package image
      if (shipmentId && Types.ObjectId.isValid(shipmentId)) {
        await connectDB();

        const packageImage = {
          url: uploadResult.url!,
          publicId: uploadResult.publicId!,
          uploadedAt: new Date(),
        };

        await Shipment.findByIdAndUpdate(shipmentId, {
          $push: { packageImages: packageImage },
        });
      }

      const response: ApiResponse<{
        url: string;
        publicId: string;
        filename: string;
      }> = {
        success: true,
        data: {
          url: uploadResult.url!,
          publicId: uploadResult.publicId!,
          filename: file.name,
        },
        message: "File uploaded successfully",
      };

      return NextResponse.json(response, { status: 201 });
    }

    const response: ApiResponse = {
      success: false,
      error: "Unsupported content type",
    };
    return NextResponse.json(response, { status: 400 });
  } catch (error) {
    console.error("Upload error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Upload failed",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

// Export with authentication
export const POST = withAuth(handlePost);
