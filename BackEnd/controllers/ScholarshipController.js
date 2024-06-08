const Scholarship = require('../models/Scholarship');
const { validationResult } = require('express-validator');

exports.createScholarship = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const scholarshipData = { ...req.body, createdBy: req.user.id };
        const scholarship = new Scholarship(scholarshipData);
        await scholarship.save();

        res.status(201).json(scholarship);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getAllScholarships = async (req, res) => {
    try {
        const scholarships = await Scholarship.find().sort({ createdAt: -1 });
        res.json(scholarships);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getScholarshipById = async (req, res) => {
    try {
        const scholarship = await Scholarship.findById(req.params.id);
        if (!scholarship) {
            return res.status(404).json({ msg: 'Scholarship not found' });
        }
        res.json(scholarship);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateScholarship = async (req, res) => {
    try {
        let scholarship = await Scholarship.findById(req.params.id);
        if (!scholarship) {
            return res.status(404).json({ msg: 'Scholarship not found' });
        }

        if (scholarship.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(scholarship);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deleteScholarship = async (req, res) => {
    try {
        const scholarship = await Scholarship.findById(req.params.id);
        if (!scholarship) {
            return res.status(404).json({ msg: 'Scholarship not found' });
        }

        if (scholarship.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        await scholarship.remove();
        res.json({ msg: 'Scholarship removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.searchScholarships = async (req, res) => {
    try {
        const { query } = req.query;
        const scholarships = await Scholarship.find({ $text: { $search: query } });
        res.json(scholarships);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.filterScholarships = async (req, res) => {
    try {
        const { country, field, provider, educationLevel } = req.query;
        let query = {};

        if (country) query.hostCountry = country;
        if (field) query.fieldsOfStudy = field;
        if (provider) query['provider.type'] = provider;
        if (educationLevel) query['qualifications.educationLevel'] = educationLevel;

        const scholarships = await Scholarship.find(query);
        res.json(scholarships);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getRecentScholarships = async (req, res) => {
    try {
        const scholarships = await Scholarship.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(scholarships);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.incrementApplicantCount = async (req, res) => {
    try {
        const scholarship = await Scholarship.findByIdAndUpdate(
            req.params.id,
            { $inc: { applicantCount: 1 } },
            { new: true }
        );
        if (!scholarship) {
            return res.status(404).json({ msg: 'Scholarship not found' });
        }
        res.json(scholarship);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};