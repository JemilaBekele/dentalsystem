import mongoose from 'mongoose';
import userReferenceSchema from "@/app/helpers/userReferenceSchema";

const AppointmentSchema = new mongoose.Schema({
  appointmentDate: {
    type: Date,
    required: [true, 'Please provide an appointment date'],
  },
  appointmentTime: {
    type: String, // You can also use Number if you want to store time in a specific format like military time
    required: [true, 'Please provide an appointment time'],
  },
  reasonForVisit: {
    type: String,
  },
  status: {
    type: String,
    required: [true, 'Please provide a status'],
    enum: ['Scheduled', 'Completed', 'Cancelled'],
  },
  doctorId: {
    id: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user ID'],
    },
    username: {
      type: String,
      required: [true, 'Please provide username'],
    },
  },
  patientId: {
    id: {
      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],
    },
    username: {
      type: String,
      required: [true, 'Please provide Patient name'],
    },
    cardno: {
      type: String,
      required: [true, 'Please provide Patient name'],
    },
  },
  createdBy: userReferenceSchema,
}, { timestamps: true });

// Avoid model recompilation during hot reloads
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

export default Appointment;
