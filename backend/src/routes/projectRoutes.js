import express from "express";
import Project from "../models/Project.js";
import createCollectionController from "../controllers/collectionController.js";
import { createCollectionUploadController } from "../controllers/fileUploadController.js";
import upload from "../middleware/multer.js";

const router = express.Router();
const controller = createCollectionController(Project);
const uploadController = createCollectionUploadController(Project);

/**
 * @route   GET /api/v1/projects
 * @desc    Get all projects with pagination and filters
 * @access  Public
 */
router.get("/", controller.getAll);

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get single project by ID
 * @access  Public
 */
router.get("/:id", controller.getById);

/**
 * @route   GET /api/v1/projects/:id/file
 * @desc    Get file URL for project
 * @access  Public
 */
router.get("/:id/file", controller.getFileUrl);

/**
 * @route   POST /api/v1/projects
 * @desc    Create new project
 * @access  Private
 */
router.post("/", controller.create);

/**
 * @route   POST /api/v1/projects/upload
 * @desc    Upload file and create project
 * @access  Private
 */
router.post("/upload", upload.single("file"), uploadController);

/**
 * @route   PATCH /api/v1/projects/:id/views
 * @desc    Increment view count
 * @access  Public
 */
router.patch("/:id/views", controller.incrementViews);

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.put("/:id", controller.update);

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete project
 * @access  Private
 */
router.delete("/:id", controller.delete);

export default router;
