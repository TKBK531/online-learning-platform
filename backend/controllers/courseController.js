const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const courseController = {
    // Get all courses
    getAllCourses: async (req, res) => {
        try {
            const courses = await Course.find().populate('instructor', 'name email');
            res.status(200).json({
                status: "success",
                message: "Courses fetched successfully",
                data: courses
            });
        } catch (error) {
            console.error("Error fetching courses:", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    },

    // Get course by ID
    getCourseById: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id).populate('instructor', 'name email');
            if (!course) {
                return res.status(404).json({
                    status: "fail",
                    message: "Course not found"
                });
            }
            res.status(200).json({
                status: "success",
                message: "Course fetched successfully",
                data: course
            });
        } catch (error) {
            console.error("Error fetching course:", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    },

    //Get enrollments for a specific course
    getEnrollments: async (req, res) => {
        try {
            const courseId = req.params.id;
            const enrollments = await Enrollment.find({ course: courseId, status: 'enrolled' }).populate('student');
            res.status(200).json({
                status: "success",
                message: "Enrollments fetched successfully",
                data: enrollments
            });
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    }
};

module.exports = courseController;

