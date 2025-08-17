const Category = require("../models/category");
const Expense = require("../models/expense");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res, next) => {
  // Get user's categories and default categories
  const categories = await Category.find({
    $or: [{ user: req.user.id }, { isDefault: true }],
  }).sort("name");

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns category or it's a default category
  if (
    !category.isDefault &&
    category.user &&
    category.user.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this category`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
exports.createCategory = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;

  // Check if category with this name already exists
  const existingCategory = await Category.findOne({
    $or: [
      { name: req.body.name, user: req.user.id },
      { name: req.body.name, isDefault: true },
    ],
  });

  if (existingCategory) {
    return next(
      new ErrorResponse(
        `Category with name ${req.body.name} already exists`,
        400
      )
    );
  }

  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns category
  if (category.isDefault) {
    return next(new ErrorResponse(`Cannot modify default category`, 401));
  }

  if (category.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this category`,
        401
      )
    );
  }

  // If name is changed, check if the new name already exists
  if (req.body.name && req.body.name !== category.name) {
    const existingCategory = await Category.findOne({
      $or: [
        { name: req.body.name, user: req.user.id },
        { name: req.body.name, isDefault: true },
      ],
    });

    if (existingCategory) {
      return next(
        new ErrorResponse(
          `Category with name ${req.body.name} already exists`,
          400
        )
      );
    }
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns category
  if (category.isDefault) {
    return next(new ErrorResponse(`Cannot delete default category`, 401));
  }

  if (category.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this category`,
        401
      )
    );
  }

  // Check if category is in use
  const expenseCount = await Expense.countDocuments({
    user: req.user.id,
    category: category.name,
  });

  if (expenseCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete category that is in use by ${expenseCount} expenses`,
        400
      )
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
