const express = require("express");
const bootcampsRouter = express.Router();
const bootcampsController = require("../controllers/bootcamps");
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advanced_result");
const { protect, authorize } = require("../middleware/auth");
bootcampsRouter.get(
  "/",

  advancedResults(Bootcamp, "courses"),
  bootcampsController.get_all_bootcamps
);
bootcampsRouter.get("/:id", bootcampsController.get_bootcamp);
bootcampsRouter.put("/:id", protect, bootcampsController.update_bootcamp);
bootcampsRouter.delete(
  "/:id",
  protect,
  authorize("publisher","admin"),
  
  bootcampsController.delete_bootcamp
);
bootcampsRouter.post("/", protect, bootcampsController.create_bootcamp);
bootcampsRouter.get(
  "/radius/:zipcode/:distance",
  bootcampsController.get_bootcamps_in_radius
);
bootcampsRouter.put(
  "/:id/photo",
  protect,
  authorize("publisher","admin"),
  bootcampsController.bootcamp_photo_upload
);
//// reroute into other recourse route
bootcampsRouter.use("/:bootcampId/courses/", courseRouter);
bootcampsRouter.use("/:bootcampId/reviews/",reviewRouter)
module.exports = bootcampsRouter;
