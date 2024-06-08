const ConferenceForum = require('../models/ConferenceForum');
const { validationResult } = require('express-validator');

exports.createConferenceForum = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const forumData = { ...req.body, createdBy: req.user.id };
        const forum = new ConferenceForum(forumData);
        await forum.save();

        res.status(201).json(forum);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getAllForums = async (req, res) => {
    try {
        const forums = await ConferenceForum.find()
            .sort({ startDate: 1 })
            .populate('createdBy', 'name email');
        res.json(forums);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getForumById = async (req, res) => {
    try {
        const forum = await ConferenceForum.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('attendees', 'name email');
        if (!forum) {
            return res.status(404).json({ msg: 'Conference/Forum not found' });
        }
        res.json(forum);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateForum = async (req, res) => {
    try {
        let forum = await ConferenceForum.findById(req.params.id);
        if (!forum) {
            return res.status(404).json({ msg: 'Conference/Forum not found' });
        }

        if (forum.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        forum = await ConferenceForum.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json(forum);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deleteForum = async (req, res) => {
    try {
        const forum = await ConferenceForum.findById(req.params.id);
        if (!forum) {
            return res.status(404).json({ msg: 'Conference/Forum not found' });
        }

        if (forum.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        await forum.remove();
        res.json({ msg: 'Conference/Forum removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.searchForums = async (req, res) => {
    try {
        const { query } = req.query;
        const forums = await ConferenceForum.find({ $text: { $search: query } })
            .sort({ startDate: 1 });
        res.json(forums);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.filterForums = async (req, res) => {
    try {
        const { location, startDate, endDate, isVirtual } = req.query;
        let query = {};

        if (location) query.location = new RegExp(location, 'i');
        if (startDate) query.startDate = { $gte: new Date(startDate) };
        if (endDate) query.endDate = { $lte: new Date(endDate) };
        if (isVirtual !== undefined) query.isVirtual = isVirtual === 'true';

        const forums = await ConferenceForum.find(query).sort({ startDate: 1 });
        res.json(forums);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.registerAttendee = async (req, res) => {
    try {
        const forum = await ConferenceForum.findById(req.params.id);
        if (!forum) {
            return res.status(404).json({ msg: 'Conference/Forum not found' });
        }

        if (forum.attendees.includes(req.user.id)) {
            return res.status(400).json({ msg: 'User already registered' });
        }

        if (forum.maxAttendees && forum.attendees.length >= forum.maxAttendees) {
            return res.status(400).json({ msg: 'Maximum attendees reached' });
        }

        forum.attendees.push(req.user.id);
        await forum.save();

        res.json(forum);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.unregisterAttendee = async (req, res) => {
    try {
        const forum = await ConferenceForum.findById(req.params.id);
        if (!forum) {
            return res.status(404).json({ msg: 'Conference/Forum not found' });
        }

        forum.attendees = forum.attendees.filter(
            attendee => attendee.toString() !== req.user.id
        );
        await forum.save();

        res.json(forum);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getUpcomingForums = async (req, res) => {
    try {
        const forums = await ConferenceForum.find({ startDate: { $gte: new Date() } })
            .sort({ startDate: 1 })
            .limit(10);
        res.json(forums);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};