const User = require('../models/User');
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');

const auth = async (req, res, next) => {
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

    req.user = decoded;
    next();
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
                message: 'Access denied.'
            });
        }
        next();
    };
};

module.exports = { auth, authorize };