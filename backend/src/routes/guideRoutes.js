import express from "express";
import Guide from "../models/Guide.js";
import createCollectionController from "../controllers/collectionController.js";
import { createCollectionUploadController } from "../controllers/fileUploadController.js";
import upload from "../middleware/multer.js";

const router = express.Router();
const controller = createCollectionController(Guide);
const uploadController = createCollectionUploadController(Guide);

/**
 * @route   GET /api/v1/guides
 * @desc    Get all guides with pagination and filters
 * @access  Public
 */
router.get("/", controller.getAll);

/**
 * @route   GET /api/v1/guides/:id
 * @desc    Get single guide by ID
 * @access  Public
 */
router.get("/:id", controller.getById);

/**
 * @route   GET /api/v1/guides/:id/file
 * @desc    Get file URL for guide
 * @access  Public
 */
router.get("/:id/file", controller.getFileUrl);

/**
 * @route   POST /api/v1/guides
 * @desc    Create new guide
 * @access  Private
 */
router.post("/", controller.create);

/**
 * @route   POST /api/v1/guides/upload
 * @desc    Upload file and create guide
 * @access  Private
 */
router.post("/upload", upload.single("file"), uploadController);

/**
 * @route   PATCH /api/v1/guides/:id/views
 * @desc    Increment view count
 * @access  Public
 */
router.patch("/:id/views", controller.incrementViews);

/**
 * @route   PUT /api/v1/guides/:id
 * @desc    Update guide
 * @access  Private
 */
router.put("/:id", controller.update);

/**
 * @route   DELETE /api/v1/guides/:id
 * @desc    Delete guide
 * @access  Private
 */
router.delete("/:id", controller.delete);

export default router;
