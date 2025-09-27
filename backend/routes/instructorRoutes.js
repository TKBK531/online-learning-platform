const express = require('express');
const path = require('path');
const router = express.Router();

const instructorController = require('../controllers/instructorController');
const { instructorOrAdmin } = require('../utils/roleBasedAuth');

// Apply middleware to all routes
router.use(instructorOrAdmin);

router.get('/dashboard/stats', instructorController.getDashboardStats);
router.post('/courses', instructorController.createCourse);
router.get('/courses', instructorController.getCourses);
router.put('/courses/:id', instructorController.updateCourse);
router.delete('/courses/:id', instructorController.deleteCourse);

module.exports = router;

