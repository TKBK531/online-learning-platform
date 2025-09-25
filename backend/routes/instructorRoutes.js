const express = require('express');
const path = require('path');
const router = express.Router();

const instructorController = require('../controllers/instructorController');
const { instructorOrAdmin, authenticated } = require('../utils/roleBasedAuth');


router.use(...instructorOrAdmin);

router.post('/courses', instructorController.createCourse);
router.get('/courses', instructorController.getCourses);
router.put('/courses/:id', instructorController.updateCourse);
router.delete('/courses/:id', instructorController.deleteCourse);

