const Semester = require('../models/Semester');

exports.getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find({ user: req.user._id }).sort({ semNumber: 1 });
    res.json({ semesters });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addSemester = async (req, res) => {
  try {
    const { name, semNumber, gpa, credits } = req.body;
    const existing = await Semester.findOne({ user: req.user._id, semNumber });
    if (existing)
      return res.status(400).json({ message: `Semester ${semNumber} already exists` });

    const semester = await Semester.create({ user: req.user._id, name, semNumber, gpa, credits });
    res.status(201).json({ semester });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!semester) return res.status(404).json({ message: 'Semester not found' });
    res.json({ semester });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteSemester = async (req, res) => {
  try {
    const semester = await Semester.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!semester) return res.status(404).json({ message: 'Semester not found' });
    res.json({ message: 'Semester deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
