const Match = require('../models/Match');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Create a skill swap request
const createMatch = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { recipientId, skillOffered, skillWanted, message } = req.body;

        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({
                status: 'error',
                message: 'Recipient user not found'
            });
        }

        // Create new match
        const match = new Match({
            requester: req.user.id,
            recipient: recipientId,
            skillOffered,
            skillWanted,
            message
        });

        await match.save();

        res.status(201).json({
            status: 'success',
            data: { match }
        });

    } catch (error) {
        console.error('Match creation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while creating match'
        });
    }
};

// Get user's matches
const getMyMatches = async (req, res) => {
    try {
        const matches = await Match.find({
            $or: [
                { requester: req.user.id },
                { recipient: req.user.id }
            ]
        });

        res.json({
            status: 'success',
            data: {
                matches
            }
        });

    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching matches'
        });
    }
};

// Update match status
const updateMatchStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { matchId } = req.params;

        const match = await Match.findById(matchId);
        
        if (!match) {
            return res.status(404).json({
                status: 'error',
                message: 'Match not found'
            });
        }

        match.status = status;
        await match.save();

        res.json({
            status: 'success',
            data: { match }
        });

    } catch (error) {
        console.error('Update match error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while updating match status'
        });
    }
};

module.exports = {
    createMatch,
    getMyMatches,
    updateMatchStatus
}; 