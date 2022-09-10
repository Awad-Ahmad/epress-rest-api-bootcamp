const User = require("../models/user");
const ErrorResponse = require("../utils/errorResponse");
const advancedResult = require("../middleware/advanced_result");

//// Get users
/// ROUTE GET /api/v1/auth/users
/// access Private Admin
exports.getUsers = async (req, res, next) => {
  res.status(200).json(res.advancedResults);
};
//// Get single user
/// ROUTE GET /api/v1/auth/users
/// access Private Admin/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      next(new ErrorResponse("the user is not found", 404));
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
//// Create single user
/// ROUTE POST /api/v1/auth/users
/// access Private Admin
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
//// Update user
/// ROUTE PUT /api/v1/auth/users/:id
/// access Private Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      next(new ErrorResponse("the user is not found", 404));
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
//// Delete user
/// ROUTE DELETE /api/v1/auth/users/:id
/// access Private Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      next(new ErrorResponse("the user is not found", 404));
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
