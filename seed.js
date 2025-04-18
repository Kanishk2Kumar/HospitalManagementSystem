const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Treatment = require('./models/Treatment');
const Bill = require('./models/Bill');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB for seeding'))
    .catch(err => console.error('MongoDB connection error:', err));

// Sample data
const doctors = [
    {
        name: "Dr. Sarah Johnson",
        specialization: "Cardiology",
        department: "Cardiology",
        contact: {
            phone: "123-456-7890",
            email: "sarah.johnson@hospital.com"
        },
        availability: [
            { day: "Monday", startTime: "09:00", endTime: "17:00" },
            { day: "Wednesday", startTime: "09:00", endTime: "17:00" }
        ],
        qualifications: [
            { degree: "MD", institution: "Harvard Medical School", year: 2010 },
            { degree: "Cardiology Fellowship", institution: "Johns Hopkins", year: 2015 }
        ],
        experience: 13,
        status: "Active"
    },
    {
        name: "Dr. Michael Chen",
        specialization: "Neurology",
        department: "Neurology",
        contact: {
            phone: "234-567-8901",
            email: "michael.chen@hospital.com"
        },
        availability: [
            { day: "Tuesday", startTime: "10:00", endTime: "18:00" },
            { day: "Thursday", startTime: "10:00", endTime: "18:00" }
        ],
        qualifications: [
            { degree: "MD", institution: "Stanford Medical School", year: 2012 },
            { degree: "Neurology Fellowship", institution: "Mayo Clinic", year: 2017 }
        ],
        experience: 11,
        status: "Active"
    }
];

const patients = [
    {
        name: "John Smith",
        age: 45,
        gender: "Male",
        contact: {
            phone: "345-678-9012",
            email: "john.smith@email.com",
            address: "123 Main St, City, State"
        },
        medicalHistory: [
            { disease: "Hypertension", description: "High blood pressure", date: new Date("2020-01-15") }
        ],
        currentDisease: "Heart Disease",
        admitDate: new Date("2023-10-01"),
        status: "Admitted"
    },
    {
        name: "Emily Davis",
        age: 32,
        gender: "Female",
        contact: {
            phone: "456-789-0123",
            email: "emily.davis@email.com",
            address: "456 Oak Ave, City, State"
        },
        medicalHistory: [
            { disease: "Migraine", description: "Chronic headaches", date: new Date("2019-05-20") }
        ],
        currentDisease: "Migraine",
        admitDate: new Date("2023-10-05"),
        status: "Admitted"
    }
];

const treatments = [
    {
        diagnosis: "Coronary Artery Disease",
        medications: [
            { name: "Aspirin", dosage: "81mg", frequency: "Once daily", duration: "Indefinite" },
            { name: "Atorvastatin", dosage: "40mg", frequency: "Once daily", duration: "Indefinite" }
        ],
        procedures: [
            { name: "Cardiac Catheterization", date: new Date("2023-10-02"), description: "Diagnostic procedure", outcome: "Successful" }
        ],
        startDate: new Date("2023-10-01"),
        status: "Ongoing"
    },
    {
        diagnosis: "Chronic Migraine",
        medications: [
            { name: "Sumatriptan", dosage: "50mg", frequency: "As needed", duration: "During episodes" },
            { name: "Propranolol", dosage: "40mg", frequency: "Twice daily", duration: "3 months" }
        ],
        procedures: [
            { name: "Neurological Examination", date: new Date("2023-10-05"), description: "Initial assessment", outcome: "Normal" }
        ],
        startDate: new Date("2023-10-05"),
        status: "Ongoing"
    }
];

const bills = [
    {
        items: [
            { description: "Cardiac Catheterization", quantity: 1, unitPrice: 5000, total: 5000 },
            { description: "Hospital Stay (3 days)", quantity: 3, unitPrice: 1000, total: 3000 }
        ],
        totalAmount: 8000,
        paidAmount: 2000,
        dueDate: new Date("2023-11-01"),
        status: "Partially Paid",
        department: "Cardiology",
        paymentHistory: [
            { amount: 2000, date: new Date("2023-10-15"), method: "Credit Card", transactionId: "CC123456" }
        ]
    },
    {
        items: [
            { description: "Neurological Consultation", quantity: 1, unitPrice: 300, total: 300 },
            { description: "MRI Scan", quantity: 1, unitPrice: 1500, total: 1500 }
        ],
        totalAmount: 1800,
        paidAmount: 0,
        dueDate: new Date("2023-11-05"),
        status: "Pending",
        department: "Neurology"
    }
];

const appointments = [
    {
        date: new Date("2023-10-20"),
        time: "14:00",
        purpose: "Follow-up consultation",
        status: "Scheduled"
    },
    {
        date: new Date("2023-10-25"),
        time: "15:30",
        purpose: "MRI results review",
        status: "Scheduled"
    }
];

// Seed function
async function seedDatabase() {
    try {
        // Clear existing data
        await Patient.deleteMany({});
        await Doctor.deleteMany({});
        await Treatment.deleteMany({});
        await Bill.deleteMany({});
        await Appointment.deleteMany({});

        console.log('Cleared existing data');

        // Insert doctors
        const insertedDoctors = await Doctor.insertMany(doctors);
        console.log('Inserted doctors');

        // Insert patients and link to doctors
        const insertedPatients = await Patient.insertMany(patients.map((patient, index) => ({
            ...patient,
            assignedDoctor: insertedDoctors[index % insertedDoctors.length]._id
        })));
        console.log('Inserted patients');

        // Insert treatments and link to patients and doctors
        const insertedTreatments = await Treatment.insertMany(treatments.map((treatment, index) => ({
            ...treatment,
            patient: insertedPatients[index]._id,
            doctor: insertedDoctors[index % insertedDoctors.length]._id
        })));
        console.log('Inserted treatments');

        // Insert bills and link to patients and treatments
        const insertedBills = await Bill.insertMany(bills.map((bill, index) => ({
            ...bill,
            patient: insertedPatients[index]._id,
            treatment: insertedTreatments[index]._id
        })));
        console.log('Inserted bills');

        // Insert appointments and link to patients and doctors
        const insertedAppointments = await Appointment.insertMany(appointments.map((appointment, index) => ({
            ...appointment,
            patient: insertedPatients[index]._id,
            doctor: insertedDoctors[index % insertedDoctors.length]._id
        })));
        console.log('Inserted appointments');

        // Update patients with treatments and bills
        for (let i = 0; i < insertedPatients.length; i++) {
            await Patient.findByIdAndUpdate(insertedPatients[i]._id, {
                $push: {
                    treatments: insertedTreatments[i]._id,
                    bills: insertedBills[i]._id
                }
            });
        }

        // Update doctors with patients and appointments
        for (let i = 0; i < insertedDoctors.length; i++) {
            await Doctor.findByIdAndUpdate(insertedDoctors[i]._id, {
                $push: {
                    patients: insertedPatients[i]._id,
                    appointments: insertedAppointments[i]._id
                }
            });
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase(); 