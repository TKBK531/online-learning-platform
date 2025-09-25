const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { adminOnly, instructorOrAdmin, studentOrAdmin, authenticated } = require('../utils/roleBasedAuth');
const { auth, authorize } = require('../middleware/authMiddleware');


// Authentication routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// User management routes
router.get('/', adminOnly, userController.getAllUsers);
router.get('/:id', adminOnly, userController.getUserById);
router.post('/', adminOnly, userController.createUser);
router.put('/:id', adminOnly, userController.updateUser);
router.delete('/:id', adminOnly, userController.deleteUser);

// Logged-in user routes
router.get('/profile', authenticated, userController.getLoggedInUser);
router.put('/profile', authenticated, userController.updateLoggedInUser);
router.delete('/profile', authenticated, userController.deleteLoggedInUser);

module.exports = router;