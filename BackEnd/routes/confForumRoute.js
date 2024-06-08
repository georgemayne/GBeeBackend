const express = require('express');
const router = express.Router();
const forumController = require('../controllers/ConferenceForumController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', forumController.getAllForums);
router.get('/search', forumController.searchForums);
router.get('/filter', forumController.filterForums);
router.get('/upcoming', forumController.getUpcomingForums);
router.get('/:id', forumController.getForumById);

// Protected routes
router.post('/', authMiddleware, forumController.createConferenceForum);
router.put('/:id', authMiddleware, forumController.updateForum);
router.delete('/:id', authMiddleware, forumController.deleteForum);
router.post('/:id/register', authMiddleware, forumController.registerAttendee);
router.post('/:id/unregister', authMiddleware, forumController.unregisterAttendee);

module.exports = router;