const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
// const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Register a new user
router.post('/vacancies/:id', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
], userController.register);

// Login a user
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], userController.login);

// Protected routes (require authentication)
// router.use(authMiddleware);

// Get user data
router.get('/me', userController.getUser);

// Update user data
router.put('/me', [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('password')
        .optional()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
], userController.updateUser);

// Delete user
router.delete('/me', userController.deleteUser);

module.exports = router;