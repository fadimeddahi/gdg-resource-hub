import asyncHandler from "../middleware/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/**
 * Upload file to Cloudinary and return URL
 * Works with any model (Project, Guide, Event, Template)
 */
export const uploadFileToCloudinary = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  try {
    // Upload to Cloudinary using buffer
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "gdg-resources",
          resource_type: "auto", // Automatically detect file type
          allowed_formats: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "jpg", "jpeg", "png", "gif", "zip"],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    res.status(200).json({
      success: true,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500);
    throw new Error("Failed to upload file to Cloudinary");
  }
});

/**
 * Create item with file upload
 * For use with POST /api/v1/:collection/upload
 */
export const createCollectionUploadController = (Model) => {
  return asyncHandler(async (req, res) => {
    const { department, title } = req.body;

    // Validation
    if (!title?.trim()) {
      res.status(400);
      throw new Error("Title is required");
    }

    if (!department) {
      res.status(400);
      throw new Error("Department is required");
    }

    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }

    try {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "gdg-resources",
            resource_type: "auto",
            allowed_formats: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "jpg", "jpeg", "png", "gif", "zip"],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      // Create item with file URL
      const item = await Model.create({
        department,
        title: title.trim(),
        fileUrl: result.secure_url,
        isActive: true,
        views: 0,
      });

      await item.populate("department", "name slug");

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500);
      throw new Error("Failed to create item with file");
    }
  });
};
