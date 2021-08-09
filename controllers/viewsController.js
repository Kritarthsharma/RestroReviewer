const Restro = require('../models/restroModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
	res.status(200).render('overview');
});
exports.getAllRestros = catchAsync(async (req, res, next) => {

	const restros = await Restro.find();

	res.status(200).render('allRestros', {
		title: 'All Restros',
		restros
	});
});

exports.getRestro = catchAsync(async (req, res, next) => {
	const restro = await Restro.findOne({ slug: req.params.slug }).populate({
		path: 'reviews',
		select: 'review rating user'
	});

	if (!restro) {
		return next(new AppError('There is no restraunt with that name!', 404)); 
	}
	res.status(200).render('restro', {
		title: `${restro.name} Restro`,
		restro
	});
});

exports.getSignupForm = (req, res, next) => {
	res.status(200).render('signup', {
		title: 'Signup'
	});
};

exports.getLoginForm = (req, res) => {
	res.status(200).render('login', {
		title: 'Login'
	});
};
exports.getForgotPasswordForm = (req, res) => {
	res.status(200).render('forgotPassword', {
		title: 'Forgot Password'
	});
};
exports.getResetPasswordForm = (req, res) => {
	res.status(200).render('resetPassword', {
		title: 'Reset Password'
	});
};

exports.getAccount = (req, res) => {
	res.status(200).render('account', {
		title: 'Your account'
	});
};

exports.updateUserData = catchAsync(async (req, res, next) => {
	const updatedUser = await User.findByIdAndUpdate(
		req.user.id,
		{
			name: req.body.name,
			email: req.body.email
		},
		{
			new: true,
			runValidators: true
		}
	);

	res.status(200).render('account', {
		title: 'Your account',
		user: updatedUser
	});
});
