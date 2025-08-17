const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const colors = require("colors");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Load models
const User = require("./models/user");
const Category = require("./models/category");
const Expense = require("./models/expense");

// Connect to DB
mongoose.connect(
  process.env.MONGO_URI || "mongodb://localhost:27017/expense-tracker",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Default user
const defaultUser = {
  username: "BassamIshaq",
  email: "bassam@example.com",
  password: "password123",
  role: "user",
};

// Default categories
const defaultCategories = [
  { name: "Food", color: "#FF5722", isDefault: true },
  { name: "Transport", color: "#2196F3", isDefault: true },
  { name: "Entertainment", color: "#4CAF50", isDefault: true },
  { name: "Bills", color: "#FFC107", isDefault: true },
  { name: "Shopping", color: "#9C27B0", isDefault: true },
  { name: "Health", color: "#E91E63", isDefault: true },
  { name: "Other", color: "#607D8B", isDefault: true },
];

// Generate sample expenses
const generateExpenses = (userId) => {
  const expenses = [];
  const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Bills",
    "Shopping",
    "Health",
    "Other",
  ];
  const today = new Date();

  // Generate expenses for the last 60 days
  for (let i = 0; i < 60; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    // Random number of expenses per day (0-3)
    const numExpenses = Math.floor(Math.random() * 4);

    for (let j = 0; j < numExpenses; j++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const amount = parseFloat((Math.random() * 100 + 5).toFixed(2));

      let description = "";

      // Generate descriptions based on category
      switch (category) {
        case "Food":
          description = ["Lunch", "Dinner", "Groceries", "Coffee", "Snacks"][
            Math.floor(Math.random() * 5)
          ];
          break;
        case "Transport":
          description = ["Uber", "Gas", "Bus Ticket", "Train", "Taxi"][
            Math.floor(Math.random() * 5)
          ];
          break;
        case "Entertainment":
          description = ["Movie", "Concert", "Subscription", "Game", "Books"][
            Math.floor(Math.random() * 5)
          ];
          break;
        case "Bills":
          description = ["Electricity", "Water", "Internet", "Phone", "Rent"][
            Math.floor(Math.random() * 5)
          ];
          break;
        case "Shopping":
          description = [
            "Clothes",
            "Electronics",
            "Furniture",
            "Gifts",
            "Accessories",
          ][Math.floor(Math.random() * 5)];
          break;
        case "Health":
          description = ["Doctor", "Medicine", "Gym", "Insurance", "Vitamins"][
            Math.floor(Math.random() * 5)
          ];
          break;
        default:
          description = [
            "Miscellaneous",
            "Donation",
            "Service",
            "Fees",
            "Subscription",
          ][Math.floor(Math.random() * 5)];
      }

      expenses.push({
        user: userId,
        amount,
        category,
        description,
        date,
      });
    }
  }

  return expenses;
};

// Import data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Expense.deleteMany();

    console.log("Data cleared...".red);

    // Create user
    const user = await User.create(defaultUser);
    console.log(`Created user: ${user.username}`.green);

    // Create categories with user reference
    const categories = await Category.create(defaultCategories);
    console.log(`Created ${categories.length} categories`.green);

    // Create user-specific categories
    const userCategories = await Category.create([
      { name: "Gifts", color: "#795548", user: user._id },
      { name: "Education", color: "#00BCD4", user: user._id },
    ]);
    console.log(`Created ${userCategories.length} user categories`.green);

    // Generate and create expenses
    const expenses = generateExpenses(user._id);
    await Expense.create(expenses);
    console.log(`Created ${expenses.length} expenses`.green);

    console.log("Data imported...".green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Expense.deleteMany();

    console.log("Data destroyed...".red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Command line args
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
} else {
  console.log("Please add proper command: -i (import) or -d (destroy)".yellow);
  process.exit();
}
