const express = require('express');
const router = express.Router();
const Treatment = require('../models/Treatment');

// Get all treatments
router.get('/', async (req, res) => {
    try {
        const treatments = await Treatment.find()
            .populate('patient')
            .populate('doctor')
            .populate('documents');
        res.json(treatments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get ongoing treatments
router.get('/ongoing', async (req, res) => {
    try {
        const treatments = await Treatment.find({ status: 'Ongoing' })
            .populate('patient')
            .populate('doctor');
        res.json(treatments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get treatment by ID
router.get('/:id', async (req, res) => {
    try {
        const treatment = await Treatment.findById(req.params.id)
            .populate('patient')
            .populate('doctor')
            .populate('documents');
        if (!treatment) {
            return res.status(404).json({ message: 'Treatment not found' });
        }
        res.json(treatment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new treatment
router.post('/', async (req, res) => {
    const treatment = new Treatment(req.body);
    try {
        const newTreatment = await treatment.save();
        res.status(201).json(newTreatment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update treatment
router.patch('/:id', async (req, res) => {
    try {
        const treatment = await Treatment.findById(req.params.id);
        if (!treatment) {
            return res.status(404).json({ message: 'Treatment not found' });
        }
        Object.assign(treatment, req.body);
        const updatedTreatment = await treatment.save();
        res.json(updatedTreatment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete treatment
router.delete('/:id', async (req, res) => {
    try {
        const treatment = await Treatment.findById(req.params.id);
        if (!treatment) {
            return res.status(404).json({ message: 'Treatment not found' });
        }
        await treatment.remove();
        res.json({ message: 'Treatment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get treatments by patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const treatments = await Treatment.find({ patient: req.params.patientId })
            .populate('patient')
            .populate('doctor')
            .populate('documents');
        res.json(treatments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get treatments by doctor
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const treatments = await Treatment.find({ doctor: req.params.doctorId })
            .populate('patient')
            .populate('doctor')
            .populate('documents');
        res.json(treatments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get treatments by status
router.get('/status/:status', async (req, res) => {
    try {
        const treatments = await Treatment.find({ status: req.params.status })
            .populate('patient')
            .populate('doctor')
            .populate('documents');
        res.json(treatments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get most used medications
router.get('/medications/top', async (req, res) => {
    try {
        const treatments = await Treatment.find();
        const medicationCount = {};
        
        treatments.forEach(treatment => {
            treatment.medications.forEach(med => {
                if (medicationCount[med.name]) {
                    medicationCount[med.name]++;
                } else {
                    medicationCount[med.name] = 1;
                }
            });
        });
        
        const topMedications = Object.entries(medicationCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
            
        res.json(topMedications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 