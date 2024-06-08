const Vacancy = require('../models/Vacancy');
const User = require('../models/User');  // Assuming you have a User model

// Create a new vacancy
exports.createVacancy = async (req, res) => {
    try {
        const vacancy = new Vacancy({
            ...req.body,
            createdBy: req.user.id  // Assuming you have auth middleware that sets req.user
        });

        await vacancy.save();
        res.status(201).json(vacancy);
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ errors: messages });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all vacancies with filtering, sorting, and pagination
exports.getVacancies = async (req, res) => {
    try {
        const queryBuilder = () => {
            const query = {};
            if (req.query.industry) query.industry = req.query.industry;
            if (req.query.employmentType) query.employmentType = req.query.employmentType;
            if (req.query.remote === 'true') query['location.remote'] = true;
            if (req.query.country) query['location.country'] = req.query.country;
            if (req.query.minSalary) query['salary.min'] = { $gte: req.query.minSalary };
            return query;
        };

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const vacancies = await Vacancy.find(queryBuilder())
            .sort({ createdAt: -1 })  // Latest first
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'name company');

        const total = await Vacancy.countDocuments(queryBuilder());

        res.json({
            vacancies,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalVacancies: total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Search vacancies by text
exports.searchVacancies = async (req, res) => {
    try {
        const { q } = req.query;
        const vacancies = await Vacancy.find(
            { $text: { $search: q } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } });

        res.json(vacancies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get a single vacancy
exports.getVacancy = async (req, res) => {
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

// Update a vacancy
exports.updateVacancy = async (req, res) => {
    try {
        const vacancy = await Vacancy.findById(req.params.id);

        if (!vacancy) {
            return res.status(404).json({ error: 'Vacancy not found' });
        }

        if (vacancy.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this vacancy' });
        }

        const updatedVacancy = await Vacancy.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json(updatedVacancy);
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ errors: messages });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a vacancy
exports.deleteVacancy = async (req, res) => {
    try {
        const vacancy = await Vacancy.findById(req.params.id);

        if (!vacancy) {
            return res.status(404).json({ error: 'Vacancy not found' });
        }

        if (vacancy.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this vacancy' });
        }

        await vacancy.remove();
        res.json({ message: 'Vacancy deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Apply to a vacancy
exports.applyToVacancy = async (req, res) => {
    try {
        const vacancy = await Vacancy.findById(req.params.id);

        if (!vacancy) {
            return res.status(404).json({ error: 'Vacancy not found' });
        }

        if (!vacancy.isActive) {
            return res.status(400).json({ error: 'This vacancy is no longer active' });
        }

        // Assuming you have an Application model or you're tracking in the User model
        // await Application.create({ user: req.user.id, vacancy: vacancy._id });
        // OR
        // await User.findByIdAndUpdate(req.user.id, { $push: { appliedJobs: vacancy._id } });

        vacancy.applicantCount += 1;
        await vacancy.save();

        res.json({ message: 'Application submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get vacancies posted by the authenticated user
exports.getMyVacancies = async (req, res) => {
    try {
        const vacancies = await Vacancy.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });

        res.json(vacancies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};