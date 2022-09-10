const ErrorResponse = require("../utils/errorResponse");

exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.log(err);

  if (err.name === "CastError") {
    const message = "castId error";
    error = new ErrorResponse(message, 400);
  }
  //// Mongoose duplicate key
  if (err.code === 11000) { 
    const message =
      "the field can not be duplicate " +
       Object.keys(err.keyValue);
    error = new ErrorResponse(message, 400);
  }
  ////////  Mongoose validation error
  if (err.name == "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statuesCode || 500).json({
    success: false,
    error: error.message || "server Error",
  });
};
