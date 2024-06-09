const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/ScholarshipController');
const authMiddleware = require('../middleware/authMiddleware');

// Public
router.get('/', scholarshipController.getAllScholarships);
router.get('/search', scholarshipController.searchScholarships);
router.get('/filter', scholarshipController.filterScholarships);
router.get('/recent', scholarshipController.getRecentScholarships);
router.get('/:id', scholarshipController.getScholarshipById);

// Protected
router.post('/', authMiddleware, scholarshipController.createScholarship);
router.put('/:id', authMiddleware, scholarshipController.updateScholarship);
router.delete('/:id', authMiddleware, scholarshipController.deleteScholarship);
router.post('/:id/apply', authMiddleware, scholarshipController.incrementApplicantCount);

module.exports = router;
