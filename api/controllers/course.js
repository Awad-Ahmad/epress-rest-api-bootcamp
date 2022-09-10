const mongoose = require("mongoose");
const Bootcamp = require("../models/Bootcamp");
const Course = require("../models/course");
const ErrorResponse = require("../utils/errorResponse");
const advancedResult = require("../middleware/advanced_result");
//// Get coursers
/// ROUTE GET /api/v1/courses
/// ROUTE GET /api/v1/bootcamps/:bootcampId/courses // get all bootcamp course
/// access Public

exports.get_all_courses = async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    courses = await Course.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
};

//// Get Single course
/// ROUTE GET /api/v1/courses/:id
/// access Public

exports.get_course = async (req, res, next) => {
  Course.findById(req.params.id)
    .populate({
      path: "bootcamp",
      select: "name",
    })
    .then((course) => {
      if (course) {
        return res.status(200).json({
          success: true,
          data: course,
        });
      } else {
        return next(new ErrorResponse("the course is not found", 404));
      }
    })
    .catch((error) => next(error));
};

//// Update Single course
/// ROUTE PUT /api/v1/courses/:id
/// access Public

exports.update_course = async (req, res, next) => {
  Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .then((course) => {
      if (req.user.id !== course.user.toString() || req.user.role !== "admin") {
        return next(
          new ErrorResponse(
            "User is not authorize to add a course to not it's bootcamp ",
            401
          )
        );
      }
      if (course) {
        res.status(200).json({
          success: true,
          data: course,
        });
      } else {
        next(new ErrorResponse("The course is not found", 404));
      }
    })
    .catch((error) => next(error));
};

//// Add Single course
/// ROUTE POST /api/v1/bootcamps/bootcampId/courses/:id
/// access Private

exports.add_course = async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  Bootcamp.findById(req.params.bootcampId)
    .then((bootcamp) => {
      if (bootcamp) {
        if (
          req.user.id !== bootcamp.user.toString() ||
          req.user.role !== "admin"
        ) {
          return next(
            new ErrorResponse(
              "User is not authorize to add a course to not it's bootcamp ",
              401
            )
          );
        }
        Course.create(req.body)
          .then((course) => {
            res.status(201).json({
              success: true,
              data: course,
            });
          })
          .catch((error) => next(error));
      } else {
        return next(new ErrorResponse("bootcamp is not found", 404));
      }
    })
    .catch((error) => next(error));
};

//// delete  course
/// ROUTE delete /api/v1/course/:id
/// access Private

exports.delete_course = async (req, res, next) => {
  Course.findById(req.params.id)
    .then((course) => {
      if (course) {
        if (
          req.user.id !== course.user.toString() ||
          req.user.role !== "admin"
        ) {
          return next(
            new ErrorResponse(
              "User is not authorize to add a course to not it's bootcamp ",
              401
            )
          );
        }
        course
          .remove()
          .then((val) => {
            res.status(200).json({
              success: true,
              data: {},
            });
          })
          .catch((error) => next(error));
      } else {
        next(new ErrorResponse("the course is not found ", 404));
      }
    })
    .catch((error) => next(error));
};
