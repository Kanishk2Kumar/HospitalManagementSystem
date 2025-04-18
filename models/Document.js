const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

const documentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    length: Number,
    chunkSize: Number,
    uploadDate: {
        type: Date,
        default: Date.now
    },
    metadata: {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient'
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor'
        },
        treatmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Treatment'
        },
        documentType: {
            type: String,
            enum: ['X-Ray', 'MRI', 'CT Scan', 'Prescription', 'Lab Report', 'Other'],
            required: true
        },
        description: String
    }
});

// Create GridFS bucket
let gfs;
mongoose.connection.once('open', () => {
    gfs = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'documents'
    });
});

// Static method to get file stream
documentSchema.statics.getFileStream = async function(fileId) {
    try {
        const file = await gfs.find({ _id: fileId }).toArray();
        if (!file || file.length === 0) {
            return null;
        }
        return gfs.openDownloadStream(fileId);
    } catch (error) {
        console.error('Error getting file stream:', error);
        return null;
    }
};

// Static method to delete file
documentSchema.statics.deleteFile = async function(fileId) {
    try {
        await gfs.delete(fileId);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

module.exports = mongoose.model('Document', documentSchema); 