const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categories");
const { protect } = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(protect);

// Base routes
router.route("/").get(getCategories).post(createCategory);

// Individual category routes
router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
