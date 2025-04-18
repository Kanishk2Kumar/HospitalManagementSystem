const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    medications: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String
    }],
    procedures: [{
        name: String,
        date: Date,
        description: String,
        outcome: String
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: Date,
    status: {
        type: String,
        enum: ['Ongoing', 'Completed', 'Discontinued'],
        default: 'Ongoing'
    },
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }],
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
treatmentSchema.index({ patient: 1 });
treatmentSchema.index({ doctor: 1 });
treatmentSchema.index({ status: 1 });
treatmentSchema.index({ startDate: 1 });

module.exports = mongoose.model('Treatment', treatmentSchema); 