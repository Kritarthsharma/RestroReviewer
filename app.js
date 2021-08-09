const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression'); // this will compress the responses sent to the client whether it is a html or css code.
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require(`./controllers/errorController`);
const restroRouter = require('./routes/restroRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
// const viewRouter = require('./routes/viewRoutes');

// Start express app
const app = express();

app.enable('trust proxy');

// 1)GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors()); // code to allow all other websites for the cross origin resource sharing.

app.options('*', cors()); 
// Serving static files
app.use(express.static(path.join(__dirname, 'public'))); 
// Set security HTTP headers
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [ "'self'", 'https:', 'http:', 'data:', 'ws:' ],
			baseUri: [ "'self'" ],
			fontSrc: [ "'self'", 'https:', 'http:', 'data:' ],
			scriptSrc: [ "'self'", 'https:', 'http:', 'blob:' ],
			styleSrc: [ "'self'", "'unsafe-inline'", 'https:', 'http:' ],
			imgSrc: [ "'self'", 'data:', 'blob:' ]
		}
	})
); // Always put this middleware at the top.

// Development logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
	max: 100, //100 requests from the same ip per hour... if the limit is crossed they will get an error.
	windowMs: 60 * 60 * 1000, // 1 hour
	message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter); // Will only affect those routes which starts from api.


// Body parser, reading data from body into req.body without this the object of the body cannot be parsed.
app.use(express.json({ limit: '10kb' })); //middleware ..... Limit the amount of data that can be sent in a body in a post or patch request. Body larger than 10kb will not be accepted.
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // parses the value from the url.
app.use(cookieParser()); // parses the data from the cookie

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // This looks at the req.body request query string and also at req.params and then it will basically filter out all of the dollar signs and dots.

// Data sanitization against XSS (Cross site scripting attacks.)
app.use(xss()); // This will clean any user input from malicious html codes.

// Prevent parameter pollution
app.use(
	hpp({
		whitelist: [ 'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price' ] // You can whitelist a property that you don't want this middleware to be applied.
	})
); // Ignores the first parameter.

app.use(compression());

// Test middleware
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString(); // learn about this date thing
	console.log(req.cookies);
	// console.log(req.headers);
	// console.log(req.headers);
	next();
});

// 2) ROUTES
// app.use('/', viewRouter);
app.use('/api/v1/restro', restroRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); //Whenever we pass any argument to the next function it will assume that it is an error and it will skip all the remaining middleware stack and send the error that we passed in.
}); // this runs for all http methods

app.use(globalErrorHandler); 

module.exports = app;
