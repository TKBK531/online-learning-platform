const User = require('../models/User');
const Course = require('../models/Course');
const CourseContent = require('../models/CourseContent');
const Enrollment = require('../models/Enrollment');

const instructorController = {
    // Get instructor dashboard statistics
    getDashboardStats: async (req, res) => {
        try {
            const instructorId = req.user.id;

            // Get all courses by this instructor
            const courses = await Course.find({ instructor: instructorId });
            const courseIds = courses.map(course => course._id);

            // Count published and draft courses
            const publishedCourses = courses.filter(course => course.status === 'published' || !course.status).length;
            const draftCourses = courses.filter(course => course.status === 'draft').length;

            // Count total students enrolled in instructor's courses
            const enrollments = await Enrollment.find({ course: { $in: courseIds } });
            const totalStudents = new Set(enrollments.map(enrollment => enrollment.student.toString())).size;

            // Count this month's enrollments
            const currentMonth = new Date();
            currentMonth.setDate(1);
            const thisMonthEnrollments = await Enrollment.countDocuments({
                course: { $in: courseIds },
                createdAt: { $gte: currentMonth }
            });

            const stats = {
                publishedCourses,
                draftCourses,
                totalStudents,
                thisMonthEnrollments
            };

            res.status(200).json({
                status: 'success',
                data: stats
            });
        } catch (error) {
            console.error('Error fetching instructor dashboard stats:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                error: error.message
            });
        }
    },

    // Create a new course
    createCourse: async (req, res) => {
        try {
            const { title, description } = req.body;
            const instructorId = req.user.id;

            const newCourse = new Course({
                title,
                description,
                instructor: instructorId,
                image: req.file ? req.file.path : null // Handle image upload
            });

            await newCourse.save();
            res.status(201).json({
                status: "success",
                message: "Course created successfully",
                data: newCourse
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Internal server error",
                error: error.message
            });
        }
    },
    // Get all courses created by the instructor
    getCourses: async (req, res) => {
        try {
            const instructorId = req.user.id;
            const courses = await Course.find({ instructor: instructorId });
            res.status(200).json({
                status: "success",
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
    // Update a course
    updateCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const instructorId = req.user.id;
            const { title, description } = req.body;

            // Build update object
            const updateData = {};
            if (title) updateData.title = title;
            if (description) updateData.description = description;
            if (req.file) updateData.image = req.file.path; // Update image if new one uploaded

            const updatedCourse = await Course.findOneAndUpdate(
                { _id: courseId, instructor: instructorId },
                updateData,
                { new: true }
            );

            if (!updatedCourse) {
                return res.status(404).json({
                    status: "fail",
                    message: "Course not found or you are not authorized to update it"
                });
            }

            res.status(200).json({
                status: "success",
                message: "Course updated successfully",
                data: updatedCourse
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Delete a course
    deleteCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const instructorId = req.user.id;
            const deletedCourse = await Course.findOneAndDelete({ _id: courseId, instructor: instructorId });
            if (!deletedCourse) {
                return res.status(404).json({
                    status: "error",
                    message: "Course not found or you are not authorized to delete it"
                });
            }
            res.status(200).json({
                status: "success",
                message: "Course deleted successfully",
                data: deletedCourse
            });
        } catch (error) {
            console.error("Error deleting course:", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    },
};

module.exports = instructorController;