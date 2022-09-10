const mongoose = require("mongoose");
const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title for the review"],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, "Please add some text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating between 1 and 10"],
  },
  bootcamp: {
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
/// one review for one bootcamp one review per single bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });
ReviewSchema.statics.getAverageCost = async function (bootcampId) {
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
        averageRating: { $avg: "$rating" },
      }, ////calculated object
    }
    
  ]);
  console.log(obj);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (error) {
    console.log(error);
  }
};
/// Call getAverageCost after save // mean after we create
ReviewSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

/// Call getAverageCost before remove // mean after we create
ReviewSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
}); 

module.exports = mongoose.model("Review", ReviewSchema);
