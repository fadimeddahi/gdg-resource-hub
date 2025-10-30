// src/controllers/resourceController.js
// Controller with example CRUD operations for Resource model.

const Resource = require('../models/Resource');

// GET /api/resources
// Returns list of resources
exports.getResources = async (req, res, next) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    next(err); // pass to error handler
  }
};

// POST /api/resources
// Creates a new resource. Expects { title, description, category }
exports.createResource = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const resource = new Resource({ title, description, category });
    await resource.save();

    res.status(201).json(resource);
  } catch (err) {
    next(err);
  }
};

// TODO: Add updateResource, deleteResource, getResourceById, and validation
