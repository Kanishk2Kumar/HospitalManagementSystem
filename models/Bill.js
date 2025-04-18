const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    treatment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Treatment'
    },
    items: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Partially Paid', 'Paid', 'Overdue'],
        default: 'Pending'
    },
    department: {
        type: String,
        required: true
    },
    paymentHistory: [{
        amount: Number,
        date: Date,
        method: String,
        transactionId: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
billSchema.index({ patient: 1 });
billSchema.index({ status: 1 });
billSchema.index({ dueDate: 1 });
billSchema.index({ department: 1 });

// Virtual for remaining amount
billSchema.virtual('remainingAmount').get(function() {
    return this.totalAmount - this.paidAmount;
});

module.exports = mongoose.model('Bill', billSchema); 