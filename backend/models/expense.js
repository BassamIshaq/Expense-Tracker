const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExpenseSchema = new Schema(
  {
    amount: {
      type: Number,
      required: [true, "Please add an amount"],
      min: [0, "Amount cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient queries
ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ category: 1, date: -1 });

module.exports = mongoose.model("Expense", ExpenseSchema);
