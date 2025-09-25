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

module.exports = auth;