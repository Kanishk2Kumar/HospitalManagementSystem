const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    contact: {
        phone: String,
        email: String,
        address: String
    },
    medicalHistory: [{
        disease: String,
        description: String,
        date: Date
    }],
    currentDisease: {
        type: String,
        required: true
    },
    admitDate: {
        type: Date,
        required: true
    },
    dischargeDate: Date,
    status: {
        type: String,
        enum: ['Admitted', 'Discharged', 'Outpatient'],
        default: 'Admitted'
    },
    assignedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    treatments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Treatment'
    }],
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }],
    bills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
patientSchema.index({ name: 1 });
patientSchema.index({ currentDisease: 1 });
patientSchema.index({ status: 1 });
patientSchema.index({ admitDate: 1 });

module.exports = mongoose.model('Patient', patientSchema); 