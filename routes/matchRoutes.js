const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const {
    createMatch,
    getMyMatches,
    updateMatchStatus
} = require('../controllers/matchController');

// Create match request
router.post('/request', auth, [
    check('recipientId', 'Recipient ID is required').notEmpty(),
    check('skillOffered', 'Skill offered is required').notEmpty(),
    check('skillWanted', 'Skill wanted is required').notEmpty(),
    check('message', 'Message is required').optional().trim()
], createMatch);

// Get my matches
router.get('/my-matches', auth, getMyMatches);

// Update match status
router.put('/:matchId/status', auth, [
    check('status', 'Status is required').isIn(['accepted', 'rejected', 'completed'])
], updateMatchStatus);

module.exports = router; 