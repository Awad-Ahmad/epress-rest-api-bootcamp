const express = require("express");
const Bootcamp = require("../models/Bootcamp");
const Review = require("../models/Review");
const ErrorResponse = require("../utils/errorResponse");

//// Get reviews or get all reviews with specific bootcamp
/// ROUTE GET /api/v1/reviews
/// ROUTE GET /api/v1/reviews/:bootcampId/reviews // get all bootcamp course
/// access Public

exports.getAllReviews = async (req, res, next) => {
  let query;
  console.log(req.params.bootcampId);
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
};
//// Get single reviews
/// ROUTE GET /api/v1/reviews/:id
/// access Public
exports.getSingleReviews = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate({
      path: "Bootcamp",
      select: "name description",
    });
    if (!review) {
      return next(new ErrorResponse("No review found with this id ", 404));
    }
    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

//// Add reviews
/// ROUTE POST /api/v1/bootcamps/:bootcampId/reviews
/// access private should be a user
exports.createReview = async (req, res, next) => {
  try {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if (!bootcamp) {
      return next(new ErrorResponse("no bootcamp with this id", 404));
    }
    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

//// Update reviews
/// ROUTE PUT /api/v1/reviews/:id
/// access private should be a user
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.bootcampId);
    if (!review) {
      return next(new ErrorResponse("no bootcamp with this id", 404));
    }
    /// make sure belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new ErrorResponse("not authorize ", 404));
    }
    const theReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(201).json({
      success: true,
      data: theReview,
    });
  } catch (error) {
    next(error);
  }
};
//// Delete reviews
/// ROUTE DELETE /api/v1/reviews/:id
/// access private should be a user
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.bootcampId);
    if (!review) {
      return next(new ErrorResponse("no bootcamp with this id", 404));
    }
    /// make sure belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new ErrorResponse("not authorize ", 404));
    }
    await review.remove();

    res.status(201).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
