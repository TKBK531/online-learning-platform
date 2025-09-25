const User = require('../models/User');

const userController = {
    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select('-password');
            res.json({
                status: "success",
                message: "Users retrieved successfully",
                data: users
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('-password');
            if (!user) return res.status(404).json(
                {
                    status: "fail",
                    message: 'User not found'
                }
            );
            res.json({
                status: "success",
                message: "User retrieved successfully",
                data: user
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get logged-in user profile
    getLoggedInUser: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            if (!user) return res.status(404).json({
                status: "fail",
                message: 'User not found'
            });
            res.json({
                status: "success",
                message: "User retrieved successfully",
                data: user
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Create new user
    createUser: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    status: "fail",
                    message: "A user with this email already exists"
                });
            }

            const newUser = new User({ name, email, password, role });
            await newUser.save();
            res.status(201).json(
                {
                    status: "success",
                    message: 'User created successfully'
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update user by ID
    updateUser: async (req, res) => {
        try {
            const { name, email, role } = req.body;
            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { name, email, role },
                { new: true }
            ).select('-password');

            if (!updatedUser) return res.status(404).json({
                status: "fail",
                message: 'User not found'
            });
            res.json({
                status: "success",
                message: 'User updated successfully',
                user: updatedUser
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update user profile
    updateLoggedInUser: async (req, res) => {
        try {
            const { name, email } = req.body;
            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { name, email },
                { new: true }
            ).select('-password');

            if (!updatedUser) return res.status(404).json({
                status: "fail",
                message: 'User not found'
            });
            res.json({
                status: "success",
                message: 'User updated successfully',
                user: updatedUser
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete user by ID
    deleteUser: async (req, res) => {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);

            if (!deletedUser) return res.status(404).json({
                status: "fail",
                message: 'User not found'
            });

            res.json({
                status: "success",
                message: 'User deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete logged-in user profile
    deleteLoggedInUser: async (req, res) => {
        try {
            const deletedUser = await User.findByIdAndDelete(req.user.id);
            if (!deletedUser) return res.status(404).json({
                status: "fail",
                message: 'User not found'
            });

            res.json({
                status: "success",
                message: 'User deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

};

module.exports = userController;