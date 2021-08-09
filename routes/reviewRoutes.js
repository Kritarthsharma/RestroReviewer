const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); // This will merge the parameters which comes from the other router. ie. tourRouter

//router.use(authController.protect);

router
	.route('/')
	.get(reviewController.getAllReviews)
	.post(
		authController.protect,
		authController.restrictTo('user'),
		reviewController.setRestroUserIds,
		reviewController.createNewReview
	);

router
	.route('/:id/:y?')
	.get(reviewController.getSingleReview)
	.patch(authController.protect, authController.restrictTo('user'), reviewController.updateReview)
	.delete(authController.protect, authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;
