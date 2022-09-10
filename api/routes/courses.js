const express = require("express");
const courseRouter = express.Router({ mergeParams: true });
const courseController = require("../controllers/course");
const advancedResults = require("../middleware/advanced_result");
const Course = require("../models/course");
const { protect } = require("../middleware/auth");

courseRouter.get(
  "/",
  advancedResults(Course, {
    path: "bootcamp",
    select: "name",
  }),
  courseController.get_all_courses
);

courseRouter.get(
  "/:id",

  courseController.get_course
);
courseRouter.post("/", protect, courseController.add_course);
courseRouter.put("/:id", protect, courseController.update_course);
courseRouter.delete("/:id", protect, courseController.delete_course);

courseRouter;
module.exports = courseRouter;
