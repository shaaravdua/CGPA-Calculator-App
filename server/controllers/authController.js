const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  const { name, email, password, college } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, college });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, college: user.college, targetCGPA: user.targetCGPA },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, college: user.college, targetCGPA: user.targetCGPA },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email, college: req.user.college, targetCGPA: req.user.targetCGPA },
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, college, targetCGPA } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, college, targetCGPA },
      { new: true, runValidators: true }
    );
    res.json({ user: { id: user._id, name: user.name, email: user.email, college: user.college, targetCGPA: user.targetCGPA } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
