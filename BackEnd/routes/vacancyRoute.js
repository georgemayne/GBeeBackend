router.post('/vacancies', authMiddleware, controller.createVacancy);
router.get('/vacancies', controller.getVacancies);
router.get('/vacancies/search', controller.searchVacancies);
router.get('/vacancies/:id', controller.getVacancy);
router.put('/vacancies/:id', authMiddleware, controller.updateVacancy);
router.delete('/vacancies/:id', authMiddleware, controller.deleteVacancy);
router.post('/vacancies/:id/apply', authMiddleware, controller.applyToVacancy);
router.get('/my/vacancies', authMiddleware, controller.getMyVacancies);