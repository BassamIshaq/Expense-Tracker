const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateDetails,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resettoken", resetPassword);

// Protected routes
router.use(protect);
router.get("/me", getMe);
router.post("/logout", logout);
router.put("/update-details", updateDetails);
router.put("/update-password", updatePassword);

module.exports = router;
