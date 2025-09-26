const { GoogleGenerativeAI } = require('@google/generative-ai');
const GPT = require('../models/GPT');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiController = {
    // Get API usage statistics
    getApiUsage: async (req, res) => {
        try {
            const totalRequests = await GPT.countDocuments();
            const userRequests = await GPT.countDocuments({ user: req.user.id });

            res.json({
                status: "success",
                data: {
                    totalApiRequests: totalRequests,
                    userRequests: userRequests,
                    remainingRequests: Math.max(0, 250 - totalRequests)
                }
            });
        } catch (error) {
            console.error('API Usage Error:', error);
            res.status(500).json({
                status: "error",
                message: "Error fetching API usage"
            });
        }
    },

    // Generate response from Gemini
    generateResponse: async (req, res) => {
        try {
            // Validate request body
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({
                    status: "fail",
                    message: "Request body is required"
                });
            }

            const { prompt } = req.body;
            const userId = req.user.id;

            // Validate prompt
            if (!prompt || prompt.trim().length === 0) {
                return res.status(400).json({
                    status: "fail",
                    message: "Prompt is required"
                });
            }

            // Check API usage limit
            const totalRequests = await GPT.countDocuments();
            if (totalRequests >= 250) {
                return res.status(429).json({
                    status: "fail",
                    message: "API request limit reached (250/250)"
                });
            }

            // Get course context for better responses
            const courses = await Course.find().populate('instructor', 'name email');

            // Create context for Gemini
            const courseContext = courses.map(course =>
                `- ${course.title}: ${course.description} (Instructor: ${course.instructor.name})`
            ).join('\n');

            const systemPrompt = `You are EduBot, a helpful assistant for an online learning platform. 

Available courses:
${courseContext}

Help students with:
- Course recommendations based on interests/goals
- Course information and prerequisites
- Learning paths and study advice
- Platform navigation

Be friendly, concise, and educational-focused. Redirect off-topic questions politely.`;

            // Initialize Gemini model
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

            // Create the full prompt for Gemini
            const fullPrompt = `${systemPrompt}\n\nStudent Question: ${prompt}`;

            // Generate response
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const responseContent = response.text();

            // Save to database
            const gptRecord = new GPT({
                prompt: prompt.trim(),
                response: responseContent,
                user: userId
            });
            await gptRecord.save();

            // Get updated usage stats
            const newTotalRequests = await GPT.countDocuments();

            res.json({
                status: "success",
                data: {
                    response: responseContent,
                    apiUsage: {
                        totalRequests: newTotalRequests,
                        remainingRequests: Math.max(0, 250 - newTotalRequests),
                        userRequests: await GPT.countDocuments({ user: userId })
                    }
                }
            });

        } catch (error) {
            console.error('Gemini API Error:', error);

            // Handle specific Gemini errors
            if (error.message?.includes('API key')) {
                return res.status(401).json({
                    status: "error",
                    message: "Invalid Gemini API key"
                });
            }

            if (error.message?.includes('quota')) {
                return res.status(402).json({
                    status: "error",
                    message: "Gemini API quota exceeded"
                });
            }

            res.status(500).json({
                status: "error",
                message: "Error generating response",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Get chat history for user
    getChatHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const chatHistory = await GPT.find({ user: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('prompt response createdAt');

            const total = await GPT.countDocuments({ user: userId });

            res.json({
                status: "success",
                data: {
                    chats: chatHistory,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalChats: total,
                        hasNext: page < Math.ceil(total / limit),
                        hasPrev: page > 1
                    }
                }
            });
        } catch (error) {
            console.error('Chat History Error:', error);
            res.status(500).json({
                status: "error",
                message: "Error fetching chat history"
            });
        }
    }
};

module.exports = geminiController;