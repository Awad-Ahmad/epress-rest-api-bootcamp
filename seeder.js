const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
//////// load env vars
dotenv.config({ path: "./config/config.env" });
////////load bootcamp
const Bootcamp = require("./api/models/Bootcamp");
const Course = require("./api/models/course");
const course = require("./api/models/course");
const User = require("./api/models/user");
const Review = require("./api/models/Review");

////// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(console.log("Mongo db connected".cyan.underline.bold))
  .catch((error) => {
    console.log(error);
  });
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/api/_data/bootcamps.json`, `utf-8`)
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/api/_data/courses.json`, `utf-8`)
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/api/_data/users.json`, `utf-8`)
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/api/_data/reviews.json`, `utf-8`)
);
console.log(reviews);
//////// Import into DB

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);
    console.log("Data Imported...".green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    // await User.deleteMany();
    await Review.deleteMany();
    console.log("Data Destroyed...".red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
