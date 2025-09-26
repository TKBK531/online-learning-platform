const express = require('express');
const path = require('path');
const router = express.Router();

const studentController = require('../controllers/studentController');
const { studentOrAdmin } = require('../utils/roleBasedAuth');

// Apply middleware to all routes
router.use(studentOrAdmin);

router.post('/courses/:id/enroll', studentController.enrollInCourse);
router.get('/courses', studentController.getEnrolledCourses);
router.post('/courses/:id/drop', studentController.dropCourse);
router.post('/courses/:id/complete', studentController.completeCourse);
router.get('/courses/completed', studentController.getCompletedCourses);

module.exports = router;
