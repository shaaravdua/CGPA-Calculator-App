const express = require('express');
const { getSubjects, saveSubjects, deleteSubject } = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getSubjects);
router.post('/save', saveSubjects);
router.delete('/:id', deleteSubject);

module.exports = router;
