const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
//const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/', viewsController.getOverview);
router.get('/allRestros', authController.isLoggedIn, viewsController.getAllRestros);
router.get('/restro/:slug', authController.isLoggedIn, viewsController.getRestro);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/forgotPassword', viewsController.getForgotPasswordForm);
router.get('/resetPassword/', viewsController.getResetPasswordForm);
router.get('/me', authController.protect, viewsController.getAccount); // checks if the user has logged in before accessing the data.
router.get(
	'/my-restros',
	/*bookingController.createBookingCheckout,*/
	authController.protect,
	viewsController.getMyRestros
); // checks if the user has logged in before accessing the data.

router.post('/submit-user-data', authController.protect, viewsController.updateUserData);

module.exports = router;
