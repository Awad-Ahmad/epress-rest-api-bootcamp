const User = require("../models/user");
const ErrorResponse = require("../utils/errorResponse");
const advancedResult = require("../middleware/advanced_result");
const bcryptjs = require("bcryptjs");
const colors = require("colors");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
//// Register user
/// ROUTE post /api/v1/auth/register
/// access Public
exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //// create a user
  bcryptjs.hash(password, 10, async (err, hash) => {
    console.log(hash);
    this.password = hash;
    console.log(this.password);
    if (hash) {
      try {
        const user = await new User({
          name,
          email,
          password: hash,
          role,
        }).save();
        console.log(user);
        //// create token
        this.sendTokenResponse(user, 200, res);
      } catch (error) {
        next(error);
      }
    }
  });
};
//// login user
/// ROUTE post /api/v1/auth/login
/// access Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  /// Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse("please provide an email and password", 400));
  }
  ///check for user
  try {
    const user = await User.findOne({ email: email }).select("+password");
    if (!user) {
      return next(new ErrorResponse("invalid credentials", 401));
    }
    /// Check if password matches

    const IsMatch = await bcryptjs.compare(
      password,
      user.password,
      (err, result) => {
        console.log(user);
        console.log(result);
        if (err) {
          console.log(err);
        }

        if (!result) {
          return next(new ErrorResponse("invalid credentials", 300));
        } else {
          console.log("true");
        }
        this.sendTokenResponse(user, 200, res);
      }
    );
    console.log(IsMatch);
  } catch (error) {
    next(error);
  }
};
/// Get token form model ,create cookie and send response
exports.sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

//// Forget Password
/// ROUTE post /api/v1/auth/forgetpassword
/// access Public
exports.forgetPassword = async (req, res, next) => {
  try {
    ////// ps: here we create a password token for 10 min that the user in this time can change the password
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      next(new ErrorResponse("There is no user with this email", 404));
    }
    //// Get reset token
    const restToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    /// Create reset Url
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/resetpassword/${restToken}`;
    const message = `you are receiving this email because you (or someone else) has
     requested the reset of password .Please make a PUT request to \n\n${resetUrl}`;
    try {
      await sendEmail({
        email: user.email,
        subject: "password reset token",
        message: message,
      });
      res.status(200).json({
        success: true,
        data: "Email sent",
      });
    } catch (error) {
      console.log(error);
      user.resetPasswordExpire = undefined;
      user.resetPasswordToken = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorResponse("Email couldn't be sent "));
    }
    console.log(restToken);
  } catch (error) {
    next(error);
  }
};
//// Reset Password
/// ROUTE PUT /api/v1/auth/resetpassword//:resettoken
/// access Public
exports.resetPassword = async (req, res, next) => {
  /// Get hash token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gte: Date.now() },
  });
  console.log(user);
  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }
  bcryptjs.hash(req.body.password, 10, async (err, hash) => {
    console.log(hash);
    user.password = hash;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    try {
      await user.save();
      this.sendTokenResponse(user, 200, res);
    } catch (error) {
      next(error);
    }
  });
};
//// Update user details
/// ROUTE PUT /api/v1/auth/updatedetails
/// access Private

exports.updateDetails = async (req, res, next) => {
  const fieldToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  try {
    const user = await User.findByIdAndUpdate(req.user.id, fieldToUpdate, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
//// Update password
/// ROUTE PUT /api/v1/auth/updatepassword
/// access Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    /// check current user
    console.log(await user.matchPasswords(req.body.password));
    if ((await user.matchPasswords(req.body.password)) === false) {
      return next(new ErrorResponse("password is not correct", 401));
    }
    bcryptjs.hash(this.password, 10, async (err, hash) => {
      console.log(hash);
      user.password = hash;
      console.log(this.password);
    });
    await user.save();
    this.sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
////// logout / clear cookie
//// GET /api/v1/auth/logout
/// private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none").expires({
    expires: new Date(Date.now() + 10 * 10000),
  });
  res.status(200).json({
    success: true,
    data: {},
  });
};
