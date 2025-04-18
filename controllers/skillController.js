const Skill = require('../models/Skill');
const { validationResult } = require('express-validator');
const Match = require('../models/Match');

// Create new skill
const createSkill = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Log the decoded token data to see what we're getting
        console.log('User data:', req.user);

        const { name, description, category, difficulty } = req.body;

        // Create new skill with the user ID from the token
        const skill = new Skill({
            name,
            description,
            category,
            difficulty,
            createdBy: req.user.id || req.user._id // Try both possible locations
        });

        await skill.save();

        res.status(201).json({
            status: 'success',
            data: { skill }
        });

    } catch (error) {
        console.error('Skill creation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while creating skill',
            debug: error.message
        });
    }
};

// Get all skills with pagination and filtering
const listSkills = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        
        // Add filters if provided
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.difficulty) {
            query.difficulty = req.query.difficulty;
        }

        const skills = await Skill.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Skill.countDocuments(query);

        res.json({
            skills,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalSkills: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all skill categories
const getCategories = async (req, res) => {
    try {
        const categories = await Skill.distinct('category');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Search skills
const searchSkills = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const skills = await Skill.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }).limit(10);

        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getSkillById = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        res.json(skill);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get trending skills
const getTrendingSkills = async (req, res) => {
    try {
        // Get skills that have been matched most frequently in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const trendingSkills = await Match.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    status: 'accepted'
                }
            },
            {
                $unwind: '$skills'
            },
            {
                $group: {
                    _id: '$skills',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'skills',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'skillDetails'
                }
            },
            {
                $unwind: '$skillDetails'
            },
            {
                $project: {
                    _id: '$skillDetails._id',
                    name: '$skillDetails.name',
                    description: '$skillDetails.description',
                    category: '$skillDetails.category',
                    matchCount: '$count'
                }
            }
        ]);

        res.json({
            status: 'success',
            data: trendingSkills
        });
    } catch (error) {
        //console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all skills
const getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find();
        res.json({
            status: 'success',
            data: skills
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching skills'
        });
    }
};

// Update a skill
const updateSkill = async (req, res) => {
    // ... existing code ...
};

// Delete a skill
const deleteSkill = async (req, res) => {
    // ... existing code ...
};

module.exports = {
    createSkill,
    listSkills,
    getCategories,
    searchSkills,
    getSkillById,
    getTrendingSkills,
    getAllSkills,
    updateSkill,
    deleteSkill
}; 