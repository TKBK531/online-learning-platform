const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// GET all users - /api/users
router.get('/', auth, userController.getAllUsers);

// GET user by ID - /api/users/:id
router.get('/:id', auth, userController.getUserById);

// POST create new user - /api/users
router.post('/', auth, userController.createUser);

// PUT update user by ID - /api/users/:id
router.put('/:id', auth, userController.updateUser);

// DELETE user by ID - /api/users/:id
router.delete('/:id', auth, userController.deleteUser);

// Authentication routes
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;