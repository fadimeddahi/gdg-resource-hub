import express from "express";
import Event from "../models/Event.js";
import createCollectionController from "../controllers/collectionController.js";

const router = express.Router();
const controller = createCollectionController(Event);

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
 * @route   POST /api/v1/events
 * @desc    Create new event
 * @access  Private
 */
router.post("/", controller.create);

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
