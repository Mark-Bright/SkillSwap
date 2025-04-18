const express = require("express");
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getRecommendedMatches,
} = require("../controllers/userController");
const { check } = require('express-validator');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const profileUpdateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
];

// Routes
router.post("/register", registerValidation, registerUser); // Register user
router.post("/login", loginValidation, loginUser); // Login user
router.get("/profile", protect, getUserProfile); // Get user profile
router.put("/profile", protect, profileUpdateValidation, updateUserProfile);
router.get("/recommend", protect, getRecommendedMatches);

module.exports = router;
