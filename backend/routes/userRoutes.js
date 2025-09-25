const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all users - /api/users
router.get('/', userController.getAllUsers);

// GET user by ID - /api/users/:id
router.get('/:id', userController.getUserById);

// POST create new user - /api/users
router.post('/', userController.createUser);

// PUT update user by ID - /api/users/:id
router.put('/:id', userController.updateUser);

// DELETE user by ID - /api/users/:id
router.delete('/:id', userController.deleteUser());

// User Login - /api/users/login
router.post('/login', userController.login);


module.exports = router;