const express = require("express");
const authController = require("../controllers/auth");
const { protect } = require("../middleware/auth");
const authRouter = express.Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/forgotpassword", authController.forgetPassword);
authRouter.put("/resetpassword/:resetToken", authController.resetPassword);
authRouter.put("/updatepassword", protect, authController.updatePassword);
authRouter.get("/logout", authController.logout);

module.exports = authRouter;
