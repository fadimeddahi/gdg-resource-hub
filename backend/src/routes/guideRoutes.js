import express from "express";
import Guide from "../models/Guide.js";
import createCollectionController from "../controllers/collectionController.js";

const router = express.Router();
const controller = createCollectionController(Guide);

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
 * @route   POST /api/v1/guides
 * @desc    Create new guide
 * @access  Private
 */
router.post("/", controller.create);

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
