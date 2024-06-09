const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/vacancies/:id', authMiddleware, adminController.vertVacancy);

router.post('/scholarships/:id', authMiddleware, adminController.vertVacancy);

router.post('/conference-forums/:id', authMiddleware, adminController.vertVacancy);

module.exports = router;
