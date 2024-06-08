const mongoose = require('mongoose');

const ScholarshipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Scholarship title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
        index: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [100, 'Description must be at least 100 characters']
    },
    provider: {
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: ['University', 'Government', 'Private', 'NGO', 'Other'], default: 'Other' },
        website: { type: String, trim: true }
    },
    amount: {
        value: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        isFullRide: { type: Boolean, default: false }
    },
    eligibility: {
        countries: [{ type: String, trim: true }],
        minAge: { type: Number },
        maxAge: { type: Number },
        gender: { type: String, enum: ['Any', 'Male', 'Female', 'Other'] },
        otherCriteria: [{ type: String }]
    },
    qualifications: {
        educationLevel: { type: String, required: true, enum: ['High School', 'Bachelor', 'Master', 'Doctorate', 'Any'] },
        minGPA: { type: Number },
        requiredTests: [{
            name: { type: String, trim: true },  // e.g., "SAT", "IELTS"
            minScore: { type: Number }
        }],
        otherRequirements: [{ type: String }]
    },
    fieldsOfStudy: [{
        type: String,
        required: true,
        trim: true,
        lowercase: true
    }],
    applicationProcess: {
        deadline: { type: Date, required: true, index: true },
        link: { type: String, required: true, trim: true },
        requiredDocs: [{ type: String }]  // e.g., ["Transcripts", "Essays", "Recommendations"]
    },
    benefits: [{
        type: String,
        trim: true
    }],  // e.g., ["Tuition", "Living Stipend", "Travel Grant"]
    
    hostCountry: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    hostInstitution: {
        type: String,
        trim: true,
        index: true
    },
    totalSlots: {
        type: Number,
        default: 1
    },
    applicantCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],  // e.g., ["stem", "women-in-tech", "undergrad"]
    
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
        index: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
});

// Update the 'updatedAt' field on every save
ScholarshipSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Compound index for country and field of study searches
ScholarshipSchema.index({ hostCountry: 1, 'fieldsOfStudy': 1 });

// Text index for full-text search
ScholarshipSchema.index({ 
    title: 'text', 
    description: 'text', 
    'fieldsOfStudy': 'text',
    'provider.name': 'text'
});

module.exports = mongoose.model('Scholarship', ScholarshipSchema);