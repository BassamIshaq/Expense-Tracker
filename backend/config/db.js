const mongoose = require("mongoose");

require("dotenv").config();

let mongoString = process.env.MONGO_URI;

mongoose
  .connect(mongoString)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error.message);
  });

module.exports = mongoose;
