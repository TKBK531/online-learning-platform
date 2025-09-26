const mongoose = require('mongoose');

const gptSchema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const GPT = mongoose.model('GPT', gptSchema);

module.exports = GPT;
