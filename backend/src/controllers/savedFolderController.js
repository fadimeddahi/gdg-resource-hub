import asyncHandler from "../middleware/asyncHandler.js";
import SavedFolder from "../models/SavedFolder.js";
import Project from "../models/Project.js";
import Guide from "../models/Guide.js";
import Event from "../models/Event.js";
import Template from "../models/Template.js";

/**
 * @desc    Get all saved folders for logged-in user
 * @route   GET /api/v1/saved-folders
 * @access  Private
 */
export const getSavedFolders = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Assuming auth middleware adds user to req

  const savedFolders = await SavedFolder.find({ user: userId })
    .populate("department", "name slug")
    .sort({ createdAt: -1 }); // Most recent first

  res.status(200).json({
    success: true,
    data: savedFolders,
    count: savedFolders.length,
  });
});

/**
 * @desc    Save a folder to library
 * @route   POST /api/v1/saved-folders
 * @access  Private
 */
export const saveFolder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    department,
    folderType,
    folderName,
    departmentName,
    departmentSlug,
    color,
  } = req.body;

  // Validation
  if (!department || !folderType || !folderName) {
    res.status(400);
    throw new Error("Department, folderType, and folderName are required");
  }

  // Validate folderType
  const validTypes = ["projects", "guides", "events", "templates"];
  if (!validTypes.includes(folderType.toLowerCase())) {
    res.status(400);
    throw new Error(
      `Invalid folder type. Must be one of: ${validTypes.join(", ")}`
    );
  }

  // Get item count for this folder
  let itemCount = 0;
  try {
    switch (folderType.toLowerCase()) {
      case "projects":
        itemCount = await Project.countDocuments({
          department,
          isActive: true,
        });
        break;
      case "guides":
        itemCount = await Guide.countDocuments({ department, isActive: true });
        break;
      case "events":
        itemCount = await Event.countDocuments({ department, isActive: true });
        break;
      case "templates":
        itemCount = await Template.countDocuments({
          department,
          isActive: true,
        });
        break;
    }
  } catch (error) {
    console.error("Error counting items:", error);
    itemCount = 0;
  }

  // Check if already saved (unique index will catch this, but nice to check)
  const existing = await SavedFolder.findOne({
    user: userId,
    department,
    folderType: folderType.toLowerCase(),
  });

  if (existing) {
    res.status(400);
    throw new Error("This folder is already in your library");
  }

  // Create saved folder
  const savedFolder = await SavedFolder.create({
    user: userId,
    department,
    folderType: folderType.toLowerCase(),
    folderName,
    departmentName: departmentName || "Unknown",
    departmentSlug: departmentSlug || "unknown",
    color: color || "blue",
    itemCount,
  });

  await savedFolder.populate("department", "name slug");

  res.status(201).json({
    success: true,
    data: savedFolder,
  });
});

/**
 * @desc    Remove folder from library
 * @route   DELETE /api/v1/saved-folders/:id
 * @access  Private
 */
export const removeSavedFolder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const savedFolder = await SavedFolder.findOne({ _id: id, user: userId });

  if (!savedFolder) {
    res.status(404);
    throw new Error("Saved folder not found or does not belong to you");
  }

  await savedFolder.deleteOne();

  res.status(200).json({
    success: true,
    message: "Folder removed from library",
  });
});

/**
 * @desc    Check if a folder is saved
 * @route   GET /api/v1/saved-folders/check?department=xxx&folderType=xxx
 * @access  Private
 */
export const checkIfSaved = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { department, folderType } = req.query;

  if (!department || !folderType) {
    res.status(400);
    throw new Error("Department and folderType are required");
  }

  const savedFolder = await SavedFolder.findOne({
    user: userId,
    department,
    folderType: folderType.toLowerCase(),
  });

  res.status(200).json({
    success: true,
    isSaved: !!savedFolder,
    data: savedFolder || null,
  });
});

/**
 * @desc    Update item count for a saved folder
 * @route   PATCH /api/v1/saved-folders/:id/count
 * @access  Private
 */
export const updateItemCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const savedFolder = await SavedFolder.findOne({ _id: id, user: userId });

  if (!savedFolder) {
    res.status(404);
    throw new Error("Saved folder not found");
  }

  // Recalculate item count
  let itemCount = 0;
  try {
    switch (savedFolder.folderType) {
      case "projects":
        itemCount = await Project.countDocuments({
          department: savedFolder.department,
          isActive: true,
        });
        break;
      case "guides":
        itemCount = await Guide.countDocuments({
          department: savedFolder.department,
          isActive: true,
        });
        break;
      case "events":
        itemCount = await Event.countDocuments({
          department: savedFolder.department,
          isActive: true,
        });
        break;
      case "templates":
        itemCount = await Template.countDocuments({
          department: savedFolder.department,
          isActive: true,
        });
        break;
    }
  } catch (error) {
    console.error("Error counting items:", error);
  }

  savedFolder.itemCount = itemCount;
  await savedFolder.save();

  res.status(200).json({
    success: true,
    data: savedFolder,
  });
});
