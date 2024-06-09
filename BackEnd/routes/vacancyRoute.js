const express = require('express');
const router = express.Router();
const controller = require('../controllers/VacancyController');
const authMiddleware = require('../middleware/authMiddleware');

// Public
router.get('', controller.getVacancies);
router.get('/search', controller.searchVacancies);
router.get('/:id', controller.getVacancy);

// Protected
router.post('', authMiddleware, controller.createVacancy);
router.put('/:id', authMiddleware, controller.updateVacancy);
router.delete('/:id', authMiddleware, controller.deleteVacancy);
router.post('/:id/apply', authMiddleware, controller.applyToVacancy);
router.get('/mine', authMiddleware, controller.getMyVacancies);

module.exports = router;
