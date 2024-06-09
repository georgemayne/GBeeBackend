const express = require('express');
const router = express.Router();
const controller = require('../controllers/VacancyController');
const authMiddleware = require('../middleware/authMiddleware');

// Public
router.get('/vacancies', controller.getVacancies);
router.get('/vacancies/search', controller.searchVacancies);
router.get('/vacancies/:id', controller.getVacancy);

// Protected
router.post('/vacancies', authMiddleware, controller.createVacancy);
router.put('/vacancies/:id', authMiddleware, controller.updateVacancy);
router.delete('/vacancies/:id', authMiddleware, controller.deleteVacancy);
router.post('/vacancies/:id/apply', authMiddleware, controller.applyToVacancy);
router.get('/my/vacancies', authMiddleware, controller.getMyVacancies);

module.exports = router;
