const Vacancy = require('../models/Vacancy');
const User = require('../models/User');  // Assuming you have a User model

// Create a new vacancy
exports.createVacancy = async (req, res) => {
    try {
        const data = {
            title: req.body.title,
            company: req.body.company,
            description: req.body.description,
            requirements: req.body.requirements,
            qualifications: req.body.qualifications,
            location: {
                city: req.body.city ? req.body.city : null,
                state: req.body.state ? req.body.state : null,
                country: req.body.country ? req.body.country : null,
                remote: req.body.remote ? true : false
            },
            salary: {
                min: req.body.min ? req.body.min : null,
                max: req.body.max ? req.body.max : null,
                currency: req.body.currency ? req.body.currency : null,
            },
            employmentType: req.body.employmentType ? req.body.employmentType : null,
            industry: req.body.industry ? req.body.industry : null,
            skills: req.body.skills ? req.body.skills : null,
            applicationDeadline: req.body.applicationDeadline ? req.body.applicationDeadline : null,
            contact: {
                email: req.body.email ? req.body.email : null,
                phone: req.body.phone ? req.body.phone : null,
                website: req.body.website ? req.body.website : null,
            },
        }

        const vacancy = new Vacancy({
            ...data,
            createdBy: req.user.id
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
        const vacancies = await Vacancy.find({
            $or: [
                { company: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { employmentType: { $regex: q, $options: 'i' } },
            ]
        });

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

        await vacancy.deleteOne();
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

        if (!vacancy.isVerified) {
            return res.status(400).json({ error: 'You cannot apply to this vacancy because it is not verified.' });
        }

        vacancy.applicantCount += 1;
        vacancy.applicants.push(req.user._id)
        await vacancy.save();

        req.user.applications.push(vacancy._id)

        await req.user.save();

        res.json({ message: 'Application submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get vacancies posted by the authenticated user
exports.getPostedVacancies = async (req, res) => {
    try {
        const vacancies = await Vacancy.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 });

        res.json(vacancies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get vacancies posted by the authenticated user
exports.getAppliedVacancies = async (req, res) => {
    try {
        const vacancies = await Vacancy.find({ applicants: req.user._id })

        res.json(vacancies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};