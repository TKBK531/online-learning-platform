const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from root .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? true // Allow all origins in production for now
        : ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/instructor', require('./routes/instructorRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/gemini', require('./routes/geminiRoutes'));
app.use('/api/gpt', require('./routes/gptRoutes'));

// Serve static files from React build (only in production)
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React app build directory
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    // Handle React routing - catch all non-API routes and return React app
    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    });
} else {
    // Development route
    app.get('/', (req, res) => {
        res.json({ message: 'Server is running in development mode!' });
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});