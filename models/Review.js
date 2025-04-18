const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500
    },
    skillRated: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent multiple reviews for the same match by the same user
ReviewSchema.index({ matchId: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema); 