const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
} = require("../controllers/users");
const { protect, authorize } = require("../middleware/auth");

// Get current user profile
router.get("/me", protect, getUserProfile);

// Admin only routes
router.use(protect);
router.use(authorize("admin"));

// Base routes - admin only
router.route("/").get(getUsers).post(createUser);

// Individual user routes - admin only
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
