const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { adminOnly, instructorOrAdmin, studentOrAdmin, authenticated } = require('../utils/roleBasedAuth');

// Authentication routes (public)
router.post('/login', authController.login);
router.post('/register', authController.register);

// Self-service routes
router.get('/profile', authenticated, userController.getLoggedInUser);
router.put('/profile', authenticated, userController.updateLoggedInUser);
router.delete('/profile', authenticated, userController.deleteLoggedInUser);

// Admin-only user management routes
router.get('/', adminOnly, userController.getAllUsers);
router.post('/', adminOnly, userController.createUser);
router.get('/:id', adminOnly, userController.getUserById);
router.put('/:id', adminOnly, userController.updateUser);
router.delete('/:id', adminOnly, userController.deleteUser);

module.exports = router;