import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary configuration and upload utilities.
 * Configured with environment variables for secure access.
 */

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Folder structure for organized file storage.
 */
const UPLOAD_FOLDER = "courier";

/**
 * Upload options based on file type.
 */
const UPLOAD_PRESETS = {
  package_images: {
    folder: `${UPLOAD_FOLDER}/package_images`,
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    max_bytes: 5 * 1024 * 1024, // 5MB per image
  },
} as const;

type UploadType = keyof typeof UPLOAD_PRESETS;

interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

interface SignatureResult {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

/**
 * Generate a signed upload signature for client-side uploads.
 * This allows direct upload from the client while keeping API secret safe.
 */
export function generateUploadSignature(
  uploadType: UploadType = "package_images"
): SignatureResult {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const preset = UPLOAD_PRESETS[uploadType];

  const params = {
    timestamp,
    folder: preset.folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder: preset.folder,
  };
}

/**
 * Upload a file to Cloudinary from the server.
 * Accepts a base64 encoded string or a URL.
 */
export async function uploadFile(
  file: string,
  uploadType: UploadType = "package_images",
  filename?: string
): Promise<UploadResult> {
  try {
    const preset = UPLOAD_PRESETS[uploadType];

    const result = await cloudinary.uploader.upload(file, {
      folder: preset.folder,
      resource_type: "auto",
      public_id: filename
        ? `${Date.now()}_${filename.replace(/\.[^/.]+$/, "")}`
        : undefined,
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Upload failed";
    console.error("❌ Cloudinary upload error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete a file from Cloudinary by public ID.
 */
export async function deleteFile(publicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok" || result.result === "not found") {
      return { success: true };
    }

    return { success: false, error: `Deletion failed: ${result.result}` };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Deletion failed";
    console.error("❌ Cloudinary delete error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Get upload constraints for a specific attachment type.
 */
export function getUploadConstraints(uploadType: UploadType) {
  return UPLOAD_PRESETS[uploadType];
}

export { cloudinary, UPLOAD_PRESETS };
export default cloudinary;
