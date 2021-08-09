const multer = require('multer');
const sharp = require('sharp');
const Restro = require('../models/restroModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// 1) ROUTE HANDLERS

// MIDDLEWARE
const multerStorage = multer.memoryStorage(); 
const multerFilter = (req, file, cb) => {
	// test if the uploaded file is an image
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new AppError('Not an image! Please upload only images.', 404), false);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
}); 

exports.uploadRestroImages = upload.fields([
	{ name: 'imageCover', maxCount: 1 },
	{ name: 'images', maxCount: 3 }
]);

exports.resizeRestroCoverImage = catchAsync(async (req, res, next) => {
	if (!req.files.imageCover) return next();

	// 1) Cover image
	req.body.imageCover = `restro-${req.params.id}-${Date.now()}-cover.jpeg`;
	await sharp(req.files.imageCover[0].buffer)
		.resize(2000, 1333) // 3/2 picture ratio
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(`public/img/restros/${req.body.imageCover}`); 

	next();
});

exports.resizeRestroImages = catchAsync(async (req, res, next) => {
	if (!req.files.images) return next();

	// 2) Images
	req.body.images = [];

	await Promise.all(
		req.files.images.map(async (file, i) => {
			const filename = `restro-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

			await sharp(file.buffer)
				.resize(2000, 1333) // 3/2 picture ratio
				.toFormat('jpeg')
				.jpeg({ quality: 90 })
				.toFile(`public/img/restros/${filename}`); 
			req.body.images.push(filename);
		})
	);

	next();
});

exports.aliasTopRestros = (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = 'price,-ratingsAverage';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};

exports.getAllRestros = factory.getAll(Restro);

exports.getSingleRestro = factory.getOne(Restro, { path: 'reviews' });

exports.createNewRestro = factory.createOne(Restro);

exports.updateRestro = factory.updateOne(Restro);

exports.deleteRestro = factory.deleteOne(Restro);

exports.getRestroStats = catchAsync(async (req, res, next) => {
	const stats = await Restro.aggregate([
		{
			$match: { ratingsAverage: { $gte: 4.5 } }
		},
		{
			$group: {
				_id: { $toUpper: '$difficulty' },
				numRestros: { $sum: 1 }, 
				numRatings: { $sum: '$ratingsQuantity' },
				avgRating: { $avg: '$ratingsAverage' },
				avgPrice: { $avg: '$price' },
				minPrice: { $min: '$price' },
				maxPrice: { $max: '$price' }
			}
		},
		{
			$sort: {
				avgPrice: 1
			}
		}
	]);

	res.status(200).json({
		status: 'success',
		data: {
			stats
		}
	});
});

