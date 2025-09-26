const User = require('../models/User');
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                status: "fail",
                message: "No token provided, authorization denied"
            });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid token, authorization denied"
            });
        }

        // Fetch full user data from database
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                status: "fail",
                message: "User not found"
            });
        }

        req.user = user; // Store full user object with role
        next();
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Server error in authentication"
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }
        next();
    };
};

module.exports = { auth, authorize };