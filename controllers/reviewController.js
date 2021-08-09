const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

// 1) ROUTE HANDLERS

exports.setRestroUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.restro) req.body.restro = req.params.restroId;
  if (!req.body.user) req.body.user = req.user.id; // from protect middleware
  next();
};

exports.getAllReviews = factory.getAll(Review);

exports.getSingleReview = factory.getOne(Review);

exports.createNewReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
