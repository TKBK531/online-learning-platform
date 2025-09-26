const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const studentController = {
    //Enroll in a course
    enrollInCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const studentId = req.user.id;

            // Check if the course exists
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    status: "fail",
                    message: "Course not found"
                });
            }

            //Check if already enrolled
            const existingEnrollment = await Enrollment.findOne({
                student: studentId,
                course: courseId,
                status: 'enrolled'
            });
            if (existingEnrollment) {
                return res.status(400).json({
                    status: "fail",
                    message: "Already enrolled in this course"
                });
            }

            let enrollment;

            const oldEnrollment = await Enrollment.findOne({
                student: studentId,
                course: courseId,
                status: 'dropped'
            });

            if (oldEnrollment) {
                oldEnrollment.status = 'enrolled';
                enrollment = await oldEnrollment.save();
            } else {
                // Create new enrollment
                enrollment = new Enrollment({
                    student: studentId,
                    course: courseId
                });
                enrollment = await enrollment.save(); // Save and assign the result
            }

            res.status(201).json({
                status: "success",
                message: "Enrolled in course successfully",
                data: enrollment
            });
        } catch (error) {
            console.error("Error enrolling in course:", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    },

    // Get all courses a student is enrolled in
    getEnrolledCourses: async (req, res) => {
        try {
            const studentId = req.user.id;
            const enrollments = await Enrollment.find({ student: studentId, status: 'enrolled' }).populate('course');
            res.status(200).json({
                status: "success",
                message: "Enrolled courses fetched successfully",
                data: enrollments
            });
        } catch (error) {
            console.error("Error fetching enrolled courses:", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    },

    // Drop a course
    dropCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const studentId = req.user.id;
            const enrollment = await Enrollment.findOne(
                { student: studentId, course: courseId, status: 'enrolled' }
            );
            if (!enrollment) {
                return res.status(404).json({
                    status: "fail",
                    message: "You are not enrolled in this course or have already dropped/completed it"
                });
            }
            enrollment.status = 'dropped';
            await enrollment.save();
            res.status(200).json({
                status: "success",
                message: "Course dropped successfully"
            });
        } catch (error) {
            console.error("Error dropping course:", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    },

    // Complete a course
    completeCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const studentId = req.user.id;
            const enrollment = await Enrollment.findOne(
                { student: studentId, course: courseId, status: 'enrolled' }
            );
            if (!enrollment) {
                return res.status(404).json({
                    status: "fail",
                    message: "You are not enrolled in this course"
                });
            }
            enrollment.status = 'completed';
            await enrollment.save();
            res.status(200).json({
                status: "success",
                message: "Course completed successfully"
            });
        } catch (error) {
            console.error("Error completing course:", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    },

    //Get all completed courses
    getCompletedCourses: async (req, res) => {
        try {
            const studentId = req.user.id;
            const enrollments = await Enrollment.find({ student: studentId, status: 'completed' }).populate('course');
            res.status(200).json({
                status: "success",
                message: "Completed courses fetched successfully",
                data: enrollments
            });
        } catch (error) {
            console.error("Error fetching completed courses:", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    }

};

module.exports = studentController;