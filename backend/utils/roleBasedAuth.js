const { auth, authorize } = require('../middleware/authMiddleware');

// Composed middleware functions
const adminOnly = async (req, res, next) => {
    auth(req, res, (err) => {
        if (err) return next(err);
        authorize('admin')(req, res, next);
    });
};

const instructorOrAdmin = async (req, res, next) => {
    auth(req, res, (err) => {
        if (err) return next(err);
        authorize('instructor', 'admin')(req, res, next);
    });
};

const studentOrAdmin = async (req, res, next) => {
    auth(req, res, (err) => {
        if (err) return next(err);
        authorize('student', 'admin')(req, res, next);
    });
};

const authenticated = async (req, res, next) => {
    auth(req, res, next);
};

module.exports = {
    adminOnly,
    instructorOrAdmin,
    studentOrAdmin,
    authenticated
};