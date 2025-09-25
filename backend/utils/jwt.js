const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (payload) => {
    return jwt.sign(
        typeof payload === 'object' ? payload : { id: payload },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '30d'
        }
    );
};

// Verify JWT Token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Decode JWT Token (without verification)
const decodeToken = (token) => {
    return jwt.decode(token);
};

// Generate Refresh Token (longer expiry)
const generateRefreshToken = (payload) => {
    return jwt.sign(
        typeof payload === 'object' ? payload : { id: payload },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
        }
    );
};

// Extract token from Authorization header
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    generateRefreshToken,
    extractTokenFromHeader
};