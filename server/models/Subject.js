const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  semesterLabel: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: 1,
    max: 6,
  },
  expectedGrade: {
    type: Number,
    required: true,
    enum: [10, 9, 8, 7, 6, 5, 4, 0],
  },
  midSemMarks: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  endSemMarks: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
