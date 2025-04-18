const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const Document = require('../models/Document');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create GridFS bucket
let gfs;
mongoose.connection.once('open', () => {
    gfs = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'documents'
    });
});

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const writeStream = gfs.openUploadStream(req.file.originalname, {
            contentType: req.file.mimetype,
            metadata: req.body
        });

        writeStream.write(req.file.buffer);
        writeStream.end();

        writeStream.on('finish', async (file) => {
            const document = new Document({
                filename: file.filename,
                contentType: file.contentType,
                length: file.length,
                chunkSize: file.chunkSize,
                metadata: req.body
            });

            await document.save();
            res.status(201).json(document);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get file by ID
router.get('/:id', async (req, res) => {
    try {
        const file = await gfs.find({ _id: new mongoose.Types.ObjectId(req.params.id) }).toArray();
        if (!file || file.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const readStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(req.params.id));
        readStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete file
router.delete('/:id', async (req, res) => {
    try {
        const file = await gfs.find({ _id: new mongoose.Types.ObjectId(req.params.id) }).toArray();
        if (!file || file.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        await gfs.delete(new mongoose.Types.ObjectId(req.params.id));
        await Document.findOneAndDelete({ _id: req.params.id });
        
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get files by patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const documents = await Document.find({ 'metadata.patientId': req.params.patientId });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get files by treatment
router.get('/treatment/:treatmentId', async (req, res) => {
    try {
        const documents = await Document.find({ 'metadata.treatmentId': req.params.treatmentId });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get files by type
router.get('/type/:type', async (req, res) => {
    try {
        const documents = await Document.find({ 'metadata.documentType': req.params.type });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 