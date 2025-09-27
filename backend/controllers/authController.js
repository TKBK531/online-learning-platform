const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

const authController = {
    // User Login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid email or password"
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid email or password"
                });
            }

            const token = generateToken({
                id: user._id,
                email: user.email,
                role: user.role
            });

            const refreshToken = generateRefreshToken({
                id: user._id,
            });

            res.json({
                status: "success",
                message: "Login successful",
                data: {
                    tokens: {
                        access: token,
                        refresh: refreshToken
                    },
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    },

    register: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    status: "fail",
                    message: "A user with this email already exists"
                });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ name, email, password: hashedPassword, role });
            await newUser.save();
            res.status(201).json({
                status: "success",
                message: "User registered successfully"
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    },

};

module.exports = authController;