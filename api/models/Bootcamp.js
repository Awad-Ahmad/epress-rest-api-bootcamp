const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");
const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description can not be more than 500 characters"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL with HTTP or HTTPS",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number can not be longer than 20 characters"],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], //array of numbers
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        /// only available values
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating must can not be more than 10"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.objectId,
      ref: "User",
      required: true,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      // required: true,
    },
  },
  ///// this for virtuals
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

/////// create bootcamp slug from the name
BootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

///  Geocode and create location field

BootcampSchema.pre("save", function (next) {
  geocoder
    .geocode(this.address)
    .then((val) => {
      this.location = {
        type: "Point",
        coordinates: [val[0].longitude, val[0].latitude],
        formattedAddress: val[0].formattedAddress,
        street: val[0].streetName,
        city: val[0].city,
        state: val[0].state,
        zipcode: val[0].zipcode,
        country: val[0].countryCode,
      };
      console.log(this.location);

      this.address = undefined;
      next();
    })

    .catch((error) => {
      console.log(error);
    });
});
/// Reverse populate with virtuals
/// virtuals is used to have here courses filed form the course Schema
BootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp", /// is same of foreign key in sql
  justOne: false,
});

///// cascade delete courses when a bootcamp is deleted
BootcampSchema.pre("remove", async function (next) {
  console.log("Courses are being removed form bootCamp");
  await this.model("Course").deleteMany({ Bootcamp: this._id });
  next();
});
module.exports = mongoose.model("Bootcamp", BootcampSchema);
