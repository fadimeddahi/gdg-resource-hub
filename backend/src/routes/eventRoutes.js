import express from "express";
import Event from "../models/Event.js";
import createCollectionController from "../controllers/collectionController.js";
import { createCollectionUploadController } from "../controllers/fileUploadController.js";
import upload from "../middleware/multer.js";

const router = express.Router();
const controller = createCollectionController(Event);
const uploadController = createCollectionUploadController(Event);

/**
 * @route   GET /api/v1/events
 * @desc    Get all events with pagination and filters
 * @access  Public
 */
router.get("/", controller.getAll);

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get single event by ID
 * @access  Public
 */
router.get("/:id", controller.getById);

/**
 * @route   GET /api/v1/events/:id/file
 * @desc    Get file URL for event
 * @access  Public
 */
router.get("/:id/file", controller.getFileUrl);

/**
 * @route   POST /api/v1/events
 * @desc    Create new event
 * @access  Private
 */
router.post("/", controller.create);

/**
 * @route   POST /api/v1/events/upload
 * @desc    Upload file and create event
 * @access  Private
 */
router.post("/upload", upload.single("file"), uploadController);

/**
 * @route   PATCH /api/v1/events/:id/views
 * @desc    Increment view count
 * @access  Public
 */
router.patch("/:id/views", controller.incrementViews);

/**
 * @route   PUT /api/v1/events/:id
 * @desc    Update event
 * @access  Private
 */
router.put("/:id", controller.update);

/**
 * @route   DELETE /api/v1/events/:id
 * @desc    Delete event
 * @access  Private
 */
router.delete("/:id", controller.delete);

export default router;
