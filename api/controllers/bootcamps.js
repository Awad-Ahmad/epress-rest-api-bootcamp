const mongoose = require("mongoose");
const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");
const geocoder = require("../utils/geocoder");
const path = require("path");
const advancedResults = require("../middleware/advanced_result");

// get all bootcamps
// route GET api/v1/bootcamps
// access public
exports.get_all_bootcamps = async (req, res, next) => {
  res.status(200).json(res.advancedResults);
};

// get all bootcamps
// route GET api/v1/bootcamps/:id
// access public
exports.get_bootcamp = (req, res, next) => {
  Bootcamp.findById(req.params.id)
    .then((bootcamp) => {
      console.log(bootcamp)
      if (bootcamp) {
        res.status(200).json({
          success: true,
          data: bootcamp,
        });
      } else {
        return next(new ErrorResponse("Bootcamp not found with this id", 404));
      }
    })
    .catch((error) => {
      next(error);
    });
};

// create all bootcamps
// route POST api/v1/bootcamps/
// access private
exports.create_bootcamp = async (req, res, next) => {
  // Add user  to req.body
  req.body.user = req.user._id;
  /// Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  ///// If the user is not admin , they can only add one bootcamp
  if (publishedBootcamp && req.user.role != "admin") {
    return next(
      new ErrorResponse("The user  has already published a bootcamp")
    );
  }
  Bootcamp.create(req.body) /// is it ok to put req.body cause of mongoose security

    .then((bootcamp) => {
      res.status(201).json({
        success: true,
        data: bootcamp,
      });
    })
    .catch((error) => {
      next(error);
    });
};

// PUT  bootcamps
// route PUT api/v1/bootcamps/:id
// access private

exports.update_bootcamp = (req, res, next) => {
  Bootcamp.findById(req.params.id)
    .then(async (bootcamp) => {
      if (bootcamp) {
        console.log(req.user.role);
        /// make sure user is bootcamp owner  or the user is admin
        if (
          req.user.id === bootcamp.user.toString() ||
          req.user.role === "admin"
        ) {
          await bootcamp.update(req.body, {
            new: true,
            runValidators: true,
          });
          res.status(200).json({
            success: true,
            data: bootcamp,
          });
        } else {
          return next(
            new ErrorResponse("user is not auth to update this bootcamp", 400)
          );
        }
      } else {
        res.status(404).json({
          success: false,
          message: "the bootcamp is not found",
        });
      }
    })
    .catch((error) => {
      next(error);
    });
};

// DELETE  bootcamps
// route DELETE api/v1/bootcamps/:id
// access private

exports.delete_bootcamp = (req, res, next) => {
  Bootcamp.findById(req.params.id)
    .then((bootcamp) => {
      if (bootcamp) {
        if (
          req.user.id === bootcamp.user.toString() ||
          req.user.role === "admin"
        ) {
          bootcamp.remove(); //// this will trigger the pre to cascade
        } else {
          new ErrorResponse("user is not auth to update this bootcamp", 400);
        }
        res.status(200).json({
          success: true,
          data: {},
        });
      } else {
        return res.status(404).json({
          success: false,
          error: "the bootcamp is not found",
        });
      }
    })
    .catch((error) => {
      next(error);
    });
};

// GET  bootcamps within a radius
// route GET  api/v1/bootcamps/radius/:zipcode/:distance
// access private

exports.get_bootcamps_in_radius = (req, res, next) => {
  const { zipcode, distance } = req.params;

  ///// get lat/lang from geocoder
  geocoder
    .geocode(zipcode)
    .then((loc) => {
      const lat = loc[0].latitude;
      const lng = loc[0].longitude;
      //// calc radius using radians
      //// divide dist by radius of Earth
      /// Earth Radius 3,963mile
      const radius = distance / 3963;
      Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lang, lat], radius] } },
      }).then((value) => {
        res.status(200).json({
          success: true,
          count: value.length,
          data: value,
        });
      });
    })
    .catch(next(error));
};

//   Upload photo for bootcamp
// route PUT  api/v1/bootcamp/:id/photo
// access private

exports.bootcamp_photo_upload = (req, res, next) => {
  Bootcamp.findById(req.params.id)
    .then((bootcamp) => {
      if (bootcamp) {
        if (
          req.user.id === bootcamp.user.toString() ||
          req.user.role === "admin"
        ) {
          console.log(req.files);
          if (!req.files) {
            return next(new ErrorResponse("please enter the file", 400));
          } else {
            const file = req.files.file;
            if (!file.mimetype.startsWith("image")) {
              return next(
                new ErrorResponse("please upload an image file ", 400)
              );
            }
            //// check file size
            if (file.size > process.env.MAX_FILE_UPLOAD) {
              return next(
                new ErrorResponse(
                  "please upload an image less than 10 mg ",
                  400
                )
              );
            }
            /// create custom filename
            file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
            file.mv(
              `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
              async (err) => {
                return next(new ErrorResponse(err.message, 500));
              }
            );
            Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
              .then((val) => {
                res.status(200).json({
                  success: true,
                  data: val,
                });
              })

              .catch((error) => next(error));
          }
        } else {
          new ErrorResponse("user is not auth to update this bootcamp", 400);
        }
      } else {
        return next(new ErrorResponse("the bootcamp is not found", 404));
      }
    })
    .catch((error) => next(error));
};
