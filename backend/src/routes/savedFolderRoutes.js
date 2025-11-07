import express from "express";
import {
  getSavedFolders,
  saveFolder,
  removeSavedFolder,
  checkIfSaved,
  updateItemCount,
} from "../controllers/savedFolderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/saved-folders
 * @desc    Get all saved folders for logged-in user
 * @access  Private
 */
router.get("/", getSavedFolders);

/**
 * @route   GET /api/v1/saved-folders/check
 * @desc    Check if a specific folder is saved
 * @query   department, folderType
 * @access  Private
 */
router.get("/check", checkIfSaved);

/**
 * @route   POST /api/v1/saved-folders
 * @desc    Save a folder to library
 * @access  Private
 */
router.post("/", saveFolder);

/**
 * @route   PATCH /api/v1/saved-folders/:id/count
 * @desc    Update item count for a saved folder
 * @access  Private
 */
router.patch("/:id/count", updateItemCount);

/**
 * @route   DELETE /api/v1/saved-folders/:id
 * @desc    Remove folder from library
 * @access  Private
 */
router.delete("/:id", removeSavedFolder);

export default router;
