const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const color = require("colors");
const crypto = require("crypto"); // to hash token
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter a name"],
  },
  email: {
    type: String,
    required: [true, "please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  role: {
    type: String,
    enum: ["user", "publisher", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "please enter a password"],
    select: false,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/// Encrypt password
UserSchema.pre("save", async function (next) {
  bcryptjs.hash(this.password, 10, async (err, hash) => {
    console.log(hash);
    this.password = hash;
    console.log(this.password);
  });

  next();
});

///// sign jwt and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
//// Generate and hash password token it call on user not on the User (model)
UserSchema.methods.getResetPasswordToken = function () {
  //// generate token
  const resetToken = crypto.randomBytes(20).toString("hex"); /// reset token
  /// Hash token and set to restPasswordToken felid
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; /// 10 minutes=600 second = 10*60seconde*1000 millisecond
  return resetToken;
};

UserSchema.methods.matchPasswords = async function (enteredPassword) {
  return await bcryptjs.compare(
    enteredPassword,
    this.password,
    (err, isMatch) => {
      if (err) {
        console.log(err.message);
      }
      console.log("is mathch" + isMatch);
    }
  );
};

module.exports = mongoose.model("User", UserSchema);
