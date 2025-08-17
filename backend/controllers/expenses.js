const Expense = require("../models/expense");
const Category = require("../models/category");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = asyncHandler(async (req, res, next) => {
  // Build query
  const query = { user: req.user.id };

  // Date filtering
  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  } else if (req.query.startDate) {
    query.date = { $gte: new Date(req.query.startDate) };
  } else if (req.query.endDate) {
    query.date = { $lte: new Date(req.query.endDate) };
  }

  // Category filtering
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Amount range filtering
  if (req.query.minAmount || req.query.maxAmount) {
    query.amount = {};
    if (req.query.minAmount) {
      query.amount.$gte = parseFloat(req.query.minAmount);
    }
    if (req.query.maxAmount) {
      query.amount.$lte = parseFloat(req.query.maxAmount);
    }
  }

  // Execute query
  const expenses = await Expense.find(query)
    .sort({ date: -1 })
    .populate("user", "username");

  res.status(200).json({
    success: true,
    count: expenses.length,
    data: expenses,
  });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(
      new ErrorResponse(`Expense not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns expense
  if (expense.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this expense`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: expense,
  });
});

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;

  // Validate category exists
  const categoryExists = await Category.findOne({
    $or: [
      { name: req.body.category, user: req.user.id },
      { name: req.body.category, isDefault: true },
    ],
  });

  if (!categoryExists) {
    // If category doesn't exist, create it
    await Category.create({
      name: req.body.category,
      user: req.user.id,
      color:
        req.body.color ||
        "#" + Math.floor(Math.random() * 16777215).toString(16),
    });
  }

  const expense = await Expense.create(req.body);

  res.status(201).json({
    success: true,
    data: expense,
  });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = asyncHandler(async (req, res, next) => {
  let expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(
      new ErrorResponse(`Expense not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns expense
  if (expense.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this expense`,
        401
      )
    );
  }

  // If category changed, validate it exists
  if (req.body.category && req.body.category !== expense.category) {
    const categoryExists = await Category.findOne({
      $or: [
        { name: req.body.category, user: req.user.id },
        { name: req.body.category, isDefault: true },
      ],
    });

    if (!categoryExists) {
      // If category doesn't exist, create it
      await Category.create({
        name: req.body.category,
        user: req.user.id,
        color:
          req.body.color ||
          "#" + Math.floor(Math.random() * 16777215).toString(16),
      });
    }
  }

  expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: expense,
  });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(
      new ErrorResponse(`Expense not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns expense
  if (expense.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this expense`,
        401
      )
    );
  }

  await expense.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get monthly expenses
// @route   GET /api/expenses/monthly/:year/:month
// @access  Private
exports.getMonthlyExpenses = asyncHandler(async (req, res, next) => {
  const { year, month } = req.params;

  // Validate year and month
  const yearNum = parseInt(year);
  const monthNum = parseInt(month) - 1; // JavaScript months are 0-indexed

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 0 || monthNum > 11) {
    return next(new ErrorResponse("Invalid year or month", 400));
  }

  // Create date range for the month
  const startDate = new Date(yearNum, monthNum, 1);
  const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999);

  const expenses = await Expense.find({
    user: req.user.id,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  res.status(200).json({
    success: true,
    count: expenses.length,
    data: expenses,
    meta: {
      year: yearNum,
      month: monthNum + 1,
      startDate,
      endDate,
    },
  });
});

// @desc    Get category totals for a month
// @route   GET /api/expenses/category-totals/:year/:month
// @access  Private
exports.getCategoryTotals = asyncHandler(async (req, res, next) => {
  const { year, month } = req.params;

  // Validate year and month
  const yearNum = parseInt(year);
  const monthNum = parseInt(month) - 1; // JavaScript months are 0-indexed

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 0 || monthNum > 11) {
    return next(new ErrorResponse("Invalid year or month", 400));
  }

  // Create date range for the month
  const startDate = new Date(yearNum, monthNum, 1);
  const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999);

  const categoryTotals = await Expense.aggregate([
    {
      $match: {
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);

  // Get category colors
  const categories = await Category.find({
    $or: [{ user: req.user.id }, { isDefault: true }],
  });

  // Add color to each category total
  const result = categoryTotals.map((item) => {
    const category = categories.find((c) => c.name === item._id);
    return {
      category: item._id,
      total: item.total,
      count: item.count,
      color: category ? category.color : "#757575",
    };
  });

  res.status(200).json({
    success: true,
    count: result.length,
    data: result,
    meta: {
      year: yearNum,
      month: monthNum + 1,
      startDate,
      endDate,
    },
  });
});
