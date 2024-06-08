const mongoose = require('mongoose');

const VacancySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
        minlength: [50, 'Description must be at least 50 characters']
    },
    requirements: [{
        type: String,
        trim: true
    }],
    qualifications: [{
        type: String,
        trim: true
    }],
    location: {
        city: { type: String, required: true, trim: true },
        state: { type: String, trim: true },
        country: { type: String, required: true, trim: true },
        remote: { type: Boolean, default: false }
    },
    salary: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: 'USD' }
    },
    employmentType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        required: true
    },
    industry: {
        type: String,
        trim: true,
        index: true  // Add index for faster queries
    },
    skills: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    applicationDeadline: {
        type: Date
    },
    contact: {
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        website: { type: String, trim: true }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicantCount: {
        type: Number,
        default: 0
    },
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
        default: Date.now,
        index: true  // Add index for sorting by creation date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
});

// Update the 'updatedAt' field on every save
VacancySchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Compound index for location-based searches
VacancySchema.index({ 'location.city': 1, 'location.country': 1 });

// Text index for full-text search
VacancySchema.index({ title: 'text', description: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Vacancy', VacancySchema);