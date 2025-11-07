import express from "express";
import Template from "../models/Template.js";
import createCollectionController from "../controllers/collectionController.js";

const router = express.Router();
const controller = createCollectionController(Template);

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
 * @route   POST /api/v1/templates
 * @desc    Create new template
 * @access  Private
 */
router.post("/", controller.create);

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
