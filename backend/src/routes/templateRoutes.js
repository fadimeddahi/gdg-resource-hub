import express from "express";
import Template from "../models/Template.js";
import createCollectionController from "../controllers/collectionController.js";
import { createCollectionUploadController } from "../controllers/fileUploadController.js";
import upload from "../middleware/multer.js";

const router = express.Router();
const controller = createCollectionController(Template);
const uploadController = createCollectionUploadController(Template);

/**
 * @route   GET /api/v1/templates
 * @desc    Get all templates with pagination and filters
 * @access  Public
 */
router.get("/", controller.getAll);

/**
 * @route   GET /api/v1/templates/:id
 * @desc    Get single template by ID
 * @access  Public
 */
router.get("/:id", controller.getById);

/**
 * @route   GET /api/v1/templates/:id/file
 * @desc    Get file URL for template
 * @access  Public
 */
router.get("/:id/file", controller.getFileUrl);

/**
 * @route   POST /api/v1/templates
 * @desc    Create new template
 * @access  Private
 */
router.post("/", controller.create);

/**
 * @route   POST /api/v1/templates/upload
 * @desc    Upload file and create template
 * @access  Private
 */
router.post("/upload", upload.single("file"), uploadController);

/**
 * @route   PATCH /api/v1/templates/:id/views
 * @desc    Increment view count
 * @access  Public
 */
router.patch("/:id/views", controller.incrementViews);

/**
 * @route   PUT /api/v1/templates/:id
 * @desc    Update template
 * @access  Private
 */
router.put("/:id", controller.update);

/**
 * @route   DELETE /api/v1/templates/:id
 * @desc    Delete template
 * @access  Private
 */
router.delete("/:id", controller.delete);

export default router;
