import asyncHandler from "../middleware/asyncHandler.js";

/**
 * Factory function to create controllers for Projects, Guides, Events, Templates
 * @param {Model} Model - Mongoose model (Project, Guide, Event, Template)
 * @returns {Object} Controller object with CRUD operations
 */
export const createCollectionController = (Model) => {
  return {
    // GET all items
    getAll: asyncHandler(async (req, res) => {
      const {
        department,
        search,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
        isActive = true,
      } = req.query;

      // Build query
      const query = {};

      if (isActive !== undefined) {
        query.isActive = isActive === "true" || isActive === true;
      }

      if (department && department !== "all") {
        query.department = department;
      }

      // Text search
      if (search) {
        query.$text = { $search: search };
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Sorting
      const sortOrder = order === "asc" ? 1 : -1;
      const sortOptions = { [sortBy]: sortOrder };

      // Execute query
      const items = await Model.find(query)
        .populate("department", "name slug")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Model.countDocuments(query);

      res.status(200).json({
        success: true,
        data: items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
        count: items.length,
      });
    }),

    // GET single item by ID
    getById: asyncHandler(async (req, res) => {
      const { id } = req.params;

      const item = await Model.findById(id).populate(
        "department",
        "name slug"
      );

      if (!item) {
        res.status(404);
        throw new Error("Item not found");
      }

      res.status(200).json({
        success: true,
        data: item,
      });
    }),

    // CREATE item
    create: asyncHandler(async (req, res) => {
      const { department, title } = req.body;

      // Validation
      if (!title?.trim()) {
        res.status(400);
        throw new Error("Title is required");
      }

      if (!department) {
        res.status(400);
        throw new Error("Department is required");
      }

      const item = await Model.create({
        department,
        title: title.trim(),
        isActive: true,
      });

      await item.populate("department", "name slug");

      res.status(201).json({
        success: true,
        data: item,
      });
    }),

    // UPDATE item
    update: asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { title, isActive } = req.body;

      const item = await Model.findById(id);

      if (!item) {
        res.status(404);
        throw new Error("Item not found");
      }

      // Update fields
      if (title?.trim()) {
        item.title = title.trim();
      }

      if (isActive !== undefined) {
        item.isActive = isActive;
      }

      await item.save();
      await item.populate("department", "name slug");

      res.status(200).json({
        success: true,
        data: item,
      });
    }),

    // DELETE item
    delete: asyncHandler(async (req, res) => {
      const { id } = req.params;

      const item = await Model.findByIdAndDelete(id);

      if (!item) {
        res.status(404);
        throw new Error("Item not found");
      }

      res.status(200).json({
        success: true,
        message: "Item deleted successfully",
      });
    }),

    // INCREMENT VIEWS
    incrementViews: asyncHandler(async (req, res) => {
      const { id } = req.params;

      const item = await Model.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      ).populate("department", "name slug");

      if (!item) {
        res.status(404);
        throw new Error("Item not found");
      }

      res.status(200).json({
        success: true,
        data: item,
      });
    }),

    // GET FILE URL
    getFileUrl: asyncHandler(async (req, res) => {
      const { id } = req.params;

      const item = await Model.findById(id).select("fileUrl title");

      if (!item) {
        res.status(404);
        throw new Error("Item not found");
      }

      if (!item.fileUrl) {
        res.status(404);
        throw new Error("No file attached to this item");
      }

      res.status(200).json({
        success: true,
        data: {
          fileUrl: item.fileUrl,
          title: item.title,
        },
      });
    }),
  };
};

export default createCollectionController;
