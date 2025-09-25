const mongoose = require('mongoose');

const courseContentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        enum: ['video', 'article', 'quiz'],
        required: true
    },
}, {
    timestamps: true
});

const CourseContent = mongoose.model('CourseContent', courseContentSchema);

module.exports = CourseContent;
