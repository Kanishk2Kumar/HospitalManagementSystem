const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Get all bills
router.get('/', async (req, res) => {
    try {
        const bills = await Bill.find()
            .populate('patient')
            .populate('treatment');
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get overdue bills
router.get('/overdue', async (req, res) => {
    try {
        const today = new Date();
        const bills = await Bill.find({
            dueDate: { $lt: today },
            status: { $ne: 'Paid' }
        })
        .populate('patient')
        .populate('treatment');
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get bill by ID
router.get('/:id', async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('patient')
            .populate('treatment');
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new bill
router.post('/', async (req, res) => {
    const bill = new Bill(req.body);
    try {
        const newBill = await bill.save();
        res.status(201).json(newBill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update bill
router.patch('/:id', async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        Object.assign(bill, req.body);
        const updatedBill = await bill.save();
        res.json(updatedBill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete bill
router.delete('/:id', async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        await bill.remove();
        res.json({ message: 'Bill deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get bills by patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const bills = await Bill.find({ patient: req.params.patientId })
            .populate('patient')
            .populate('treatment');
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get bills by status
router.get('/status/:status', async (req, res) => {
    try {
        const bills = await Bill.find({ status: req.params.status })
            .populate('patient')
            .populate('treatment');
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get revenue by department
router.get('/revenue/department', async (req, res) => {
    try {
        const revenue = await Bill.aggregate([
            {
                $group: {
                    _id: '$department',
                    totalRevenue: { $sum: '$totalAmount' },
                    paidAmount: { $sum: '$paidAmount' }
                }
            }
        ]);
        res.json(revenue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Record payment
router.post('/:id/payment', async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const payment = {
            amount: req.body.amount,
            date: new Date(),
            method: req.body.method,
            transactionId: req.body.transactionId
        };

        bill.paymentHistory.push(payment);
        bill.paidAmount += payment.amount;

        if (bill.paidAmount >= bill.totalAmount) {
            bill.status = 'Paid';
        } else if (bill.paidAmount > 0) {
            bill.status = 'Partially Paid';
        }

        const updatedBill = await bill.save();
        res.json(updatedBill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 