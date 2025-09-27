const OpenAI = require('openai');
const GPT = require('../models/GPT');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const gptController = {
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

    // Generate response from GPT
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

            // Create context for GPT
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

            // Make OpenAI API call
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
                max_tokens: 300,
                temperature: 0.7,
            });

            // Extract the response content
            const responseContent = completion.choices[0].message.content;

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
            console.error('GPT API Error:', error);

            // Handle specific OpenAI errors
            if (error.code === 'insufficient_quota') {
                return res.status(402).json({
                    status: "error",
                    message: "OpenAI API quota exceeded"
                });
            }

            if (error.code === 'invalid_api_key') {
                return res.status(401).json({
                    status: "error",
                    message: "Invalid OpenAI API key"
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

module.exports = gptController;