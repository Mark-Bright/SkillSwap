const Review = require('../models/Review');
const Match = require('../models/Match');
const { validationResult } = require('express-validator');

// Create a review
exports.createReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { matchId, rating, comment, skillRated } = req.body;

        // Verify match exists and is completed
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                status: 'error',
                message: 'Match not found'
            });
        }

        if (match.status !== 'completed') {
            return res.status(400).json({
                status: 'error',
                message: 'Can only review completed matches'
            });
        }

        // Verify user was part of the match
        if (match.requester.toString() !== req.user.id && 
            match.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to review this match'
            });
        }

        // Determine recipient (the other user in the match)
        const recipient = match.requester.toString() === req.user.id 
            ? match.recipient 
            : match.requester;

        // Check if review already exists
        const existingReview = await Review.findOne({
            matchId,
            reviewer: req.user.id
        });

        if (existingReview) {
            return res.status(400).json({
                status: 'error',
                message: 'You have already reviewed this match'
            });
        }

        // Create review
        const review = new Review({
            matchId,
            reviewer: req.user.id,
            recipient,
            rating,
            comment,
            skillRated
        });

        await review.save();
        await review.populate('reviewer recipient skillRated');

        res.status(201).json({
            status: 'success',
            data: { review }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while creating review'
        });
    }
};

// Get reviews received by user
exports.getReceivedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ recipient: req.user.id })
            .populate('reviewer skillRated matchId')
            .sort('-createdAt');

        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 
            ? (totalRating / reviews.length).toFixed(1) 
            : 0;

        // Group reviews by skill
        const reviewsBySkill = reviews.reduce((acc, review) => {
            const skillId = review.skillRated._id.toString();
            if (!acc[skillId]) {
                acc[skillId] = {
                    skill: review.skillRated,
                    reviews: [],
                    averageRating: 0
                };
            }
            acc[skillId].reviews.push(review);
            acc[skillId].averageRating = (
                acc[skillId].reviews.reduce((sum, r) => sum + r.rating, 0) / 
                acc[skillId].reviews.length
            ).toFixed(1);
            return acc;
        }, {});

        res.json({
            status: 'success',
            data: {
                averageRating,
                totalReviews: reviews.length,
                reviewsBySkill,
                reviews
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching reviews'
        });
    }
}; 