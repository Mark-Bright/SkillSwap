const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

// Validation middleware for sending messages
const messageValidation = [
    check('receiver', 'Receiver ID is required').not().isEmpty(),
    check('content', 'Message content is required').not().isEmpty()
];

// Send a message
router.post('/send', auth, messageValidation, messageController.sendMessage);

// Get all conversations
router.get('/conversations', auth, messageController.getConversations);

// Get chat history with a specific user
router.get('/:userId/chat', auth, messageController.getChatHistory);

module.exports = router; 