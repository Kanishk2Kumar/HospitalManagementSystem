const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// Get all doctors
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('patients')
            .populate('appointments');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get active doctors
router.get('/active', async (req, res) => {
    try {
        const doctors = await Doctor.find({ status: 'Active' })
            .populate('patients')
            .populate('appointments');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('patients')
            .populate('appointments');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new doctor
router.post('/', async (req, res) => {
    const doctor = new Doctor(req.body);
    try {
        const newDoctor = await doctor.save();
        res.status(201).json(newDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update doctor
router.patch('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        Object.assign(doctor, req.body);
        const updatedDoctor = await doctor.save();
        res.json(updatedDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        await doctor.remove();
        res.json({ message: 'Doctor deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get doctors by department
router.get('/department/:department', async (req, res) => {
    try {
        const doctors = await Doctor.find({ department: req.params.department })
            .populate('patients')
            .populate('appointments');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get doctor's workload (number of patients)
router.get('/:id/workload', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('patients');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json({
            doctor: doctor.name,
            totalPatients: doctor.patients.length,
            patients: doctor.patients
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 