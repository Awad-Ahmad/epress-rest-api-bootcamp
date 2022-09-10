const mongoose = require("mongoose");
const color=require('colors')
connectDB = () => 
{
  mongoose
    .connect(process.env.MONGO_URI)
    .then(console.log("Mongo db connected".cyan.underline.bold))
    .catch((error) => {
      console.log(error);
    });
};
module.exports = connectDB;
