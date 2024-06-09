const Vacancy = require('../models/Vacancy');
const Scholarship = require('../models/Scholarship');
const ConferenceForums = require('../models/Conference_Forums');


// vert a single vacancy
exports.vertVacancy = async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'admin')
            return res.status(422).json({ error: 'You must be an administrator.' })

        const vacancy = await Vacancy.findById(req.params.id);

        if (!vacancy) {
            return res.status(404).json({ error: 'Vacancy not found' });
        }
        
        vacancy['isVerified'] = true;
        await vacancy.save();

        res.json(vacancy);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// vert a single scholarship
exports.vertScholarship = async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'admin')
            return res.status(422).json({ error: 'You must be an administrator.' })

        const scholarship = await Scholarship.findById(req.params.id);

        if (!scholarship) {
            return res.status(404).json({ error: 'Scholarship not found' });
        }
        
        scholarship['isVerified'] = true;
        await scholarship.save();

        res.json(scholarship);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// vert a single conferenceForums
exports.vertConferenceForum = async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'admin')
            return res.status(422).json({ error: 'You must be an administrator.' })

        const conferenceForums = await ConferenceForums.findById(req.params.id);

        if (!conferenceForums) {
            return res.status(404).json({ error: 'Conference Forums not found' });
        }
        
        conferenceForums['isVerified'] = true;
        await conferenceForums.save();

        res.json(conferenceForums);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
