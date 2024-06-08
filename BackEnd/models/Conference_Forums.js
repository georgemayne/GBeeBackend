const mongoose = require('mongoose');

const ConferenceForumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Conference/Forum title is required'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [50, 'Description must be at least 50 characters']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    organizer: {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        website: { type: String, trim: true }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    isVirtual: {
        type: Boolean,
        default: false
    },
    registrationLink: {
        type: String,
        trim: true
    },
    maxAttendees: {
        type: Number
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
});

// Update 'updatedAt' on every save
ConferenceForumSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Ensure endDate is after startDate
ConferenceForumSchema.path('endDate').validate(function(value) {
    return this.startDate <= value;
}, 'End date must be after or equal to start date.');

// Compound index for location and date searches
ConferenceForumSchema.index({ location: 1, startDate: 1 });

// Text index for full-text search
ConferenceForumSchema.index({ 
    title: 'text', 
    description: 'text', 
    'organizer.name': 'text',
    tags: 'text'
});

module.exports = mongoose.model('ConferenceForum', ConferenceForumSchema);