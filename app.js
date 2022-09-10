const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: "./config/config.env" });
const bootcampsRouter = require("./api/routes/bootcamps");
const logger = require("./api/middleware/logger");
const color = require("colors");
const morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const { errorHandler } = require("./api/middleware/error");
const courseRouter = require("./api/routes/courses");
const fileUpload = require("express-fileupload");
const authRouter = require("./api/routes/auth");
const cookieParser = require("cookie-parser");
const userRouter = require("./api/routes/user");
const reviewRouter = require("./api/routes/reviews");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const cores =require("cores")
const rateLimiter = require("express-rate-limit");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
/// cookie parser
app.use(cookieParser());

// app.use(express.json()) /// is it like body-parser
connectDB();
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
/// set security headers
app.use(helmet());
// prevent xss attacks
app.use(xss());
app.use(fileUpload());
app.use(mongoSanitize());
/// prevent http parameter pollution
app.use(hpp());
///  Rate limiting
const limiter = rateLimiter({
  windowMs: 10 * 60 * 100, // 10 minutes 
  max: 100,
}); /// one hundred request per ten minutes
app.use(limiter);
//// enable cores 
app.use(cores())// to enable other domain to communicate to my restApi 
app.use("/api/v1/bootcamps", bootcampsRouter);
app.use("/api/v1/courses/", courseRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/auth/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.use(errorHandler);
/// File upload
// app.use(fileUpload())
/// set static folder
app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, console.log("server is connected".yellow.bold));
process.on("unhandledRejection", (error, promise) => {
  console.log({ error: error.message }.red);
  ///close sever
  server.close(() => {
    process.exit(1);
  });
});
