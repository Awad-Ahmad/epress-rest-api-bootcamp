exports.logger = (req, res, next) => {
  console.log(req.method + req.protocol + req.originalUrl);
  next();
};
