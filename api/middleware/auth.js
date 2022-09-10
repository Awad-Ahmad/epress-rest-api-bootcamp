const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/user");

//// protect route
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; ///this for split the token
  }
    else if(req.cookies.token)
    {
      token = req.cookies.token
    }/// here if we don't user token the cookie will be used 
  if (!token) {
    return next(new ErrorResponse("Not authorize to access this route ", 404));
  }
  try {
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
};
//// Grant access to specific roles

exports.authorize = (...roles) => {
  /// we case pase it in publisher,admin
  return (req, res, next) => {
    console.log(roles);
    if (!roles.includes(req.user.role)) {
      ///check if the role passed is included in the user role
      return next(
        new ErrorResponse(
          "user role is not authorized tto access this route",
          403
        )
      );
    }
    next();
  };
};
