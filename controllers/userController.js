const multer = require("multer"); // middleware for handling multipart/form-data, which is primarily used for uploading files.
const sharp = require("sharp"); // this is a image processing library for node js ... it resizes the images in a very simple way.
const User = require("../models/usermodel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

const multerStorage = multer.memoryStorage(); // This way the image will be stored as buffer in the memory.

const multerFilter = (req, file, cb) => {
  // test if the uploaded file is an image
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 404), false);
  }
};

// const upload = multer({ dest: 'public/img/users' }); // destination to upload. If no option specified the uploaded image would simply be stored in memory and not saved anywhere to the disk.
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}); // destination to upload. If no option specified the uploaded image would simply be stored in memory and not saved anywhere to the disk.

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`); // its best to not save the file to the disk while its processing but instead save it to the memory

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    // Object.keys returns an array then we loop over it.
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// 1) ROUTE HANDLERS

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user posts password data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }

  // 2) Filtered out unwanted field names that are not allowed to be updated.
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createNewUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined! Please use /signup instead",
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getSingleUser = factory.getOne(User);

// DO NOT UPDATE PASSWORDS WITH THIS!
exports.updateUser = factory.updateOne(User); // Only for admins and only to update the data and not the password

exports.deleteUser = factory.deleteOne(User); //Administrator function for permanently deleting a user.
