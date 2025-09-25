const User = require('../models/User');
const Course = require('../models/Course');
const CourseContent = require('../models/CourseContent');
const Enrollment = require('../models/Enrollment');

const instructorController = {
    // Create a new course
    createCourse: async (req, res) => {
        try {
            const { title, description } = req.body;
            const instructorId = req.user.id;
            const newCourse = new Course({
                title,
                description,
                instructor: instructorId
            });
            await newCourse.save();
            res.status(201).json({
                status: "success",
                message: "Course created successfully",
                data: newCourse
            });
        } catch (error) {
            console.error("Error creating course:", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
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

            const updatedCourse = await Course.findOneAndUpdate(
                { _id: courseId, instructor: instructorId },
                { title, description },
                { new: true }
            );

            if (!updatedCourse) {
                return res.status(404).json({
                    status: "error",
                    message: "Course not found or you are not authorized to update it"
                });
            }

            res.status(200).json({
                status: "success",
                message: "Course updated successfully",
                data: updatedCourse
            });
        } catch (error) {
            console.error("Error updating course:", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
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