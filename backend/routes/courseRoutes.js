const express = require('express');
const path = require('path');
const router = express.Router();

const courseController = require('../controllers/courseController');

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

module.exports = router;