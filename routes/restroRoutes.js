const express = require('express');
const restroController = require('../controllers/restroController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();


router.use('/:restroId/reviews', reviewRouter); // router itself is a middleware so we can implement use method on it. Also known as mounting the router. Everytime if the route is like this it will redirect to reviewRouter.

router.route('/top-5-cheap').get(restroController.aliasTopRestros, restroController.getAllRestros);

router.route('/restro-stats').get(restroController.getRestroStats);

router
	.route('/')
	.get(restroController.getAllRestros)
	.post(authController.protect, authController.restrictTo('admin'), restroController.createNewRestro); // We could have also added catchAsync function as these are async function handler.
router
	.route('/:id/:y?')
	.get(restroController.getSingleRestro)
	.patch(
		restroController.uploadRestroImages,
		restroController.resizeRestroCoverImage,
		restroController.resizeRestroImages,
		authController.protect,
		authController.restrictTo('admin'),
		restroController.updateRestro
	)
	.delete(authController.protect, authController.restrictTo('admin'), restroController.deleteRestro);

module.exports = router;
