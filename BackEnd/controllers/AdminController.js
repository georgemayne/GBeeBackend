const Vacancy = require('../models/Vacancy');


// Get a single vacancy
exports.vertVacancy = async (req, res) => {
    try {
        const vacancy = await Vacancy.findById(req.params.id)
            .populate('createdBy', 'name company email');

        if (!vacancy) {
            return res.status(404).json({ error: 'Vacancy not found' });
        }

        res.json(vacancy);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};