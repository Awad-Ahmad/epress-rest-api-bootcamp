const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/user");
const { authorize, protect } = require("../middleware/auth");
const advancedResult = require("../middleware/advanced_result");
const User = require("../models/user");
const { application } = require("express");
userRouter.use(protect);
userRouter.use(authorize("admin"));/// here any route will be protected and authorized

userRouter.get("/", advancedResult(User) ,userController.getUsers);
userRouter.get("/:id", advancedResult(User), userController.getUser);
userRouter.post("/", userController.createUser);
userRouter.put("/:id", userController.updateUser);
userRouter.delete("/:id", userController.deleteUser);

module.exports=userRouter
