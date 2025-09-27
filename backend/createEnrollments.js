const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
require('dotenv').config();

const createEnrollments = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the demo student and instructor
        const student = await User.findOne({ email: 'student@demo.com' });
        const instructor = await User.findOne({ email: 'instructor@demo.com' });

        if (!student || !instructor) {
            console.error('Demo users not found');
            return;
        }

        // Find published courses by the instructor
        const publishedCourses = await Course.find({
            instructor: instructor._id,
            $or: [{ status: 'published' }, { status: { $exists: false } }]
        });

        console.log(`Found ${publishedCourses.length} published courses`);

        // Create enrollments for the student
        for (const course of publishedCourses) {
            const existingEnrollment = await Enrollment.findOne({
                student: student._id,
                course: course._id
            });

            if (!existingEnrollment) {
                const enrollment = new Enrollment({
                    student: student._id,
                    course: course._id,
                    status: 'enrolled'
                });

                await enrollment.save();
                console.log(`✅ Created enrollment: ${student.name} -> ${course.title}`);
            } else {
                console.log(`ℹ️  Enrollment already exists: ${student.name} -> ${course.title}`);
            }
        }

        console.log('✅ All enrollments created successfully!');

        console.log('✅ Enrollments setup completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating enrollments:', error);
        process.exit(1);
    }
};

createEnrollments();