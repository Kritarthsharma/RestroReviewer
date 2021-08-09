const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}.`; // .path = _id , value = wrong value
	return new AppError(message, 404);
};

const handleDuplicateFieldsDB = (err) => {
	const value = Object.values(err.keyValue)[0];
	const message = `Duplicate field value: "${value}". Please use another value!`;

	return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);

	const message = `Invalid input data. ${errors.join('. ')}`;
	return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
	// A) API
	if (req.originalUrl.startsWith('/api')) {
		// Gives the whole url other than the host.
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack
		});
	}
	// B) RENDERED WEBSITE
	console.error('Error 💥 ', err); // More logging libraries available on npm.
	return res.status(err.statusCode).render('error', {
		title: 'Something went wrong!',
		msg: err.message
	});
};

const sendErrorProd = (err, req, res) => {
	// A) API
	if (req.originalUrl.startsWith('/api')) {
		// A) Operational, trusted error : send message to client
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message
			});
		}
		// B) Programming or other unknown error: don't leak error details
		// 1) Log error
		console.error('Error 💥 ', err);
		// 2) Send generic message
		return res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!'
		});
	}
	// B) RENDERED WEBSITE
	// Operational, trusted error : send message to client
	if (err.isOperational) {
		return res.status(err.statusCode).render('error', {
			title: 'Something went wrong!',
			msg: err.message
		});
	}
	// Programming or other unknown error: don't leak error details
	// 1) Log error
	console.error('Error 💥 ', err); // More logging libraries available on npm.
	// 2) Send generic message
	return res.status(err.statusCode).render('error', {
		title: 'Something went wrong!',
		msg: 'Please try again later!'
	});
};

module.exports = (err, req, res, next) => {
	// will be called whenever an argument is placed in next().
	// Global error handling middleware.
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err }; //  Object.create(err) it also can make the error object it then imports the whole prototype cause in new mongoose update the name and many properties exist in the prototype.
		error.message = err.message;

		if (err.stack.includes('CastError')) error = handleCastErrorDB(error); // err.name == 'CastError' // mongoose error // When mongoose is unable to find the specified id
		if (error.code === 11000) error = handleDuplicateFieldsDB(error); // MongoDB error // When there are two similiar properties.
		if (error._message === 'Validation failed') error = handleValidationErrorDB(error); // mongoose error
		if (error.name === 'JsonWebTokenError') error = handleJWTError(); // Jwt sign verification error
		if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(); // Jwt time expired error.

		sendErrorProd(error, req, res);
	}
};
