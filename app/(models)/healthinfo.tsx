import mongoose from 'mongoose';
import userReferenceSchema from "@/app/helpers/userReferenceSchema";

const HealthinfoSchema = new mongoose.Schema({
  bloodgroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  weight: {
    type: String,
  },
  height: {
    type: String,
  },
  allergies: {
    type: String,
  },
  habits: {
    type: String,
  },
  patientId: {
    id: {
      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],
    }
  },
  createdBy: userReferenceSchema,
}, { timestamps: true });

// Avoid model recompilation during hot reloads
const Healthinfo = mongoose.models.Healthinfo || mongoose.model('Healthinfo', HealthinfoSchema);

export default Healthinfo;
