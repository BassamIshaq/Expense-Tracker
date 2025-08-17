const express = require("express");
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlyExpenses,
  getCategoryTotals,
} = require("../controllers/expenses");
const { protect } = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(protect);

// Base routes
router.route("/").get(getExpenses).post(createExpense);

// Individual expense routes
router.route("/:id").get(getExpense).put(updateExpense).delete(deleteExpense);

// Analytics routes
router.get("/monthly/:year/:month", getMonthlyExpenses);
router.get("/category-totals/:year/:month", getCategoryTotals);

module.exports = router;
