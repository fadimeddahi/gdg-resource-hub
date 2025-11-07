import express from "express";
import Project from "../models/Project.js";
import createCollectionController from "../controllers/collectionController.js";

const router = express.Router();
const controller = createCollectionController(Project);

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
 * @route   POST /api/v1/projects
 * @desc    Create new project
 * @access  Private
 */
router.post("/", controller.create);

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
