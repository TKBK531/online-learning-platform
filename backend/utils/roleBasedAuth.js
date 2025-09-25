const { auth, authorize } = require('../middleware/authMiddleware')

// Middleware combinations
const adminOnly = [auth, authorize('admin')];
const instructorOrAdmin = [auth, authorize('instructor', 'admin')];
const studentOrAdmin = [auth, authorize('student', 'admin')];
const authenticated = [auth];

module.exports = {
    adminOnly,
    instructorOrAdmin,
    studentOrAdmin,
    authenticated
};