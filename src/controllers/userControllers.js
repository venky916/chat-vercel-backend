const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { generateToken } = require('../helper/helperFunctions');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, photoUrl } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please Enter all the Fields');
  }

  const isExistingUser = await User.findOne({ email });

  if (isExistingUser) {
    res.status(400);
    throw new Error('User already exists ');
  }

  const user = await User.create({
    name,
    email,
    password,
    photoUrl,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Failed to create the user');
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid Credentials');
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  //   const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user._id } })
    .select('-password -__v'); // Exclude password and Mongoose version field

  // console.log(users);

  res.send(users);
});

module.exports = {
  registerUser,
  authUser,
  allUsers,
};
