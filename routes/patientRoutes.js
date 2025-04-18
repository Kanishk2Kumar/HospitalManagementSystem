const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Get all patients
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find()
            .populate('assignedDoctor')
            .populate('treatments')
            .populate('documents')
            .populate('bills');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get currently admitted patients
router.get('/admitted', async (req, res) => {
    try {
        const patients = await Patient.find({ status: 'Admitted' })
            .populate('assignedDoctor')
            .populate('treatments');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .populate('assignedDoctor')
            .populate('treatments')
            .populate('documents')
            .populate('bills');
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new patient
router.post('/', async (req, res) => {
    const patient = new Patient(req.body);
    try {
        const newPatient = await patient.save();
        res.status(201).json(newPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update patient
router.patch('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        Object.assign(patient, req.body);
        const updatedPatient = await patient.save();
        res.json(updatedPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete patient
router.delete('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        await patient.remove();
        res.json({ message: 'Patient deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get patients by disease
router.get('/disease/:disease', async (req, res) => {
    try {
        const patients = await Patient.find({ currentDisease: req.params.disease })
            .populate('assignedDoctor')
            .populate('treatments');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 