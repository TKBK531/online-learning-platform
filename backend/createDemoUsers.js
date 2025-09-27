const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
require('dotenv').config();

const createDemoUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Demo users data
        const demoUsers = [
            {
                name: 'Admin User',
                email: 'admin@demo.com',
                password: 'admin123',
                role: 'admin'
            },
            {
                name: 'John Instructor',
                email: 'instructor@demo.com',
                password: 'instructor123',
                role: 'instructor'
            },
            {
                name: 'Jane Student',
                email: 'student@demo.com',
                password: 'student123',
                role: 'student'
            }
        ];

        // Create users
        let instructorUser, studentUser;
        for (const userData of demoUsers) {
            let user = await User.findOne({ email: userData.email });

            if (!user) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                user = new User({
                    name: userData.name,
                    email: userData.email,
                    password: hashedPassword,
                    role: userData.role
                });

                await user.save();
                console.log(`✅ Created demo ${userData.role}: ${userData.email}`);
            } else {
                console.log(`ℹ️  Demo ${userData.role} already exists: ${userData.email}`);
            }

            // Store instructor and student references for creating courses/enrollments
            if (userData.role === 'instructor') {
                instructorUser = user;
            } else if (userData.role === 'student') {
                studentUser = user;
            }
        }

        // Create demo courses
        const demoCourses = [
            {
                title: 'Introduction to React',
                description: 'Learn the fundamentals of React.js development',
                instructor: instructorUser._id,
                status: 'published'
            },
            {
                title: 'Advanced JavaScript',
                description: 'Master advanced JavaScript concepts and patterns',
                instructor: instructorUser._id,
                status: 'published'
            },
            {
                title: 'Node.js Fundamentals',
                description: 'Build backend applications with Node.js',
                instructor: instructorUser._id,
                status: 'published'
            },
            {
                title: 'Python for Data Science',
                description: 'Introduction to data analysis with Python',
                instructor: instructorUser._id,
                status: 'draft'
            },
            {
                title: 'Machine Learning Basics',
                description: 'Get started with machine learning concepts',
                instructor: instructorUser._id,
                status: 'draft'
            }
        ];

        const createdCourses = [];
        for (const courseData of demoCourses) {
            const existingCourse = await Course.findOne({
                title: courseData.title,
                instructor: courseData.instructor
            });

            if (!existingCourse) {
                const course = new Course(courseData);
                await course.save();
                createdCourses.push(course);
                console.log(`✅ Created demo course: ${courseData.title}`);
            } else {
                createdCourses.push(existingCourse);
                console.log(`ℹ️  Demo course already exists: ${courseData.title}`);
            }
        }

        // Create demo enrollments (only for published courses)
        const publishedCourses = createdCourses.filter(course => course.status === 'published');
        for (const course of publishedCourses) {
            const existingEnrollment = await Enrollment.findOne({
                student: studentUser._id,
                course: course._id
            });

            if (!existingEnrollment) {
                const enrollment = new Enrollment({
                    student: studentUser._id,
                    course: course._id,
                    status: 'active',
                    progress: Math.floor(Math.random() * 80) + 10 // Random progress between 10-90%
                });

                await enrollment.save();
                console.log(`✅ Created enrollment: ${studentUser.name} -> ${course.title}`);
            } else {
                console.log(`ℹ️  Enrollment already exists: ${studentUser.name} -> ${course.title}`);
            }
        }

        console.log('✅ Demo data setup completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating demo users:', error);
        process.exit(1);
    }
};

createDemoUsers();