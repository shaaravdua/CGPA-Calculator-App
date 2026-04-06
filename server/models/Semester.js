const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Semester name is required'],
    trim: true,
  },
  semNumber: {
    type: Number,
    required: true,
  },
  gpa: {
    type: Number,
    required: [true, 'GPA is required'],
    min: 0,
    max: 10,
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: 1,
    max: 60,
  },
  isCompleted: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

semesterSchema.index({ user: 1, semNumber: 1 }, { unique: true });

module.exports = mongoose.model('Semester', semesterSchema);
