const express = require("express");
const reviewRouter = express.Router({ mergeParams: true });
const reviewController = require("../controllers/reviews");
const advancedResults = require("../middleware/advanced_result");
const Review = require("../models/Review");
const { protect, authorize } = require("../middleware/auth");

reviewRouter.get(
  "/",
  advancedResults(Review, {
    path: "bootcamp",
    select: "name",
  }),
  reviewController.getAllReviews
);
reviewRouter.post(
  "/",
  protect,
  authorize("user", "admin"),
  reviewController.createReview
);
reviewRouter.get(
  "/:id",
  advancedResults(Review, {
    path: "bootcamp",
    select: "name",
  }),
  reviewController.getSingleReviews
);
reviewRouter.put(
  "/:id",
  protect,
  authorize("user", "admin"),
  reviewController.updateReview
);
reviewRouter.delete(
  "/:id",
  protect,
  authorize("user", "admin"),
  reviewController.deleteReview
);
module.exports = reviewRouter;
