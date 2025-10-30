// src/routes/resourceRoutes.js
// Express router for /api/resources endpoints.

const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// GET /api/resources - list
router.get('/', resourceController.getResources);

// POST /api/resources - create
router.post('/', resourceController.createResource);

module.exports = router;
