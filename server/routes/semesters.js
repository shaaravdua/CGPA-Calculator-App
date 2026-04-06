const express = require('express');
const { getSemesters, addSemester, updateSemester, deleteSemester } = require('../controllers/semesterController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getSemesters);
router.post('/', addSemester);
router.patch('/:id', updateSemester);
router.delete('/:id', deleteSemester);

module.exports = router;
