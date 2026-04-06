const Subject = require('../models/Subject');

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id });
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.saveSubjects = async (req, res) => {
  try {
    const { semesterLabel, subjects } = req.body;

    // Replace all subjects for this user's current semester label
    await Subject.deleteMany({ user: req.user._id, semesterLabel });

    const created = await Subject.insertMany(
      subjects.map(s => ({ ...s, user: req.user._id, semesterLabel }))
    );
    res.status(201).json({ subjects: created });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    await Subject.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
