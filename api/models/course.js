const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  weeks: {
    type: String,
    required: [true, "Please add number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "Please add a tuition cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a minimum skill"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    ////relationship between course and bootcamp
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    ////relationship between course and user
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});
/// static function to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log("object");

  const obj = await this.aggregate([
    {
      $match: {
        bootcamp: bootcampId,
      },
    },
      {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      }, ////calculated object
    }
    
  ]);
  console.log(obj);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: obj[0].averageCost,
    });
  } catch (error) {
    console.log(error);
  }
};
/// Call getAverageCost after save // mean after we create
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

/// Call getAverageCost before remove // mean after we create
CourseSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});
module.exports = mongoose.model("Course", CourseSchema);
