import mongoose from "mongoose";
 // Import Order model


import userReferenceSchema from "@/app/helpers/userReferenceSchema"; 
// Define the schemas

const patientSchema = new mongoose.Schema({
    cardno: {
      type: String,
      required: [true, "Please provide a card number"],
      unique: true,
    },
    firstname: {
      type: String,
      required: [true, "Please provide a firstname"],
      minlength: 3,
      maxlength: 50,
    },
   
    age: {
      type: String,
      required: [true, "Please provide an age"],
    },
    sex: {
      type: String,
      enum: ['male', 'female'],
      required: [true, "Please provide a sex"],
    },
    
    phoneNumber: {
      type: String,
     
    },
    Town:{
      type: String,
    },
     KK:{
      type: String,

     }, 
    HNo:{
      type: String,
     },

    description: {
      type: String,
    },
    createdBy: userReferenceSchema,
    Order: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    MedicalFinding: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MedicalFinding",
      },
    ],
    Healthinfo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Healthinfo",
      },
    ],
    Appointment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    Image: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
    Invoice: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
      },
    ],
    Card: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
      },
    ]
    
  }, { 
    timestamps: true,  // Standard options
    strictPopulate: false // Add it as part of the main options object
  });
  
const Patient = mongoose.models.Patient || mongoose.model("Patient", patientSchema);
  
export default Patient;
  

