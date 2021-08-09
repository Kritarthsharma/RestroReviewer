const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(204).json({
			status: 'success',
			data: null
		});
	});

exports.updateOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true //when updating a document this is needed as to check for the validator during update
		});

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(201).send({
			status: 'success',
			data: {
				data: doc
			}
		});
	});

exports.createOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.create(req.body);

		res.status(201).json({
			status: 'success',
			data: {
				data: doc
			}
		});
	});

exports.getOne = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (popOptions) query = query.populate(popOptions);
		const doc = await query; // // We have not populated this on query middleware because we want to show a review only on a single tour.

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(200).json({
			status: 'success',
			data: {
				data: doc
			}
		});
	});

exports.getAll = (Model) =>
	catchAsync(async (req, res, next) => {
		// To allow for nested GET reviews on tour (hack for reviews)
		let filter = {};
		if (req.params.restroId) filter = { restro: req.params.restroId }; // Get all the reviews of one particular tour.

		// EXECUTE QUERY
		const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
		// const doc = await features.query.explain();
		const doc = await features.query;

		// There should not be an error when user requests all the tours unless if there is an error in database.

		// SEND RESPONSE
		res.status(200).json({
			status: 'success',
			requestedAt: req.requestTime,
			results: doc.length,
			data: {
				data: doc
			}
		});
	});
