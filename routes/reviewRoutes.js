const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');


router.post('/create', protect, reviewController.createReview);
router.get('/received', protect, reviewController.getReceivedReviews);

module.exports = router; 