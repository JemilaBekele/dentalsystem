import { NextRequest, NextResponse } from 'next/server';
import HealthinfoModel from '@/app/(models)/healthinfo';
import Patient from '@/app/(models)/Patient';
import { authorizedMiddleware } from '@/app/helpers/authentication';

// Define Healthinfo interface based on your schema
interface Healthinfo {
  bloodgroup: string;
  weight: number;
  height: number;
  allergies: string[];
  habits: string[];
  createdAt: string; // Use Date if applicable
}

// Create a new medical finding
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
 await authorizedMiddleware(request);
  

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    if (typeof request === 'object' && request !== null && 'user' in request) {
      const user = (request as { user: { id: string; username: string } }).user; // Type assertion for user
      console.log("User Data:", user);

    const { bloodgroup, weight, height, allergies, habits } = await request.json();

    // Validate patient existence
    const patient = await Patient.findById(id).exec();
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Create new Healthinfo
    const newHealthinfo = new HealthinfoModel({
      bloodgroup,
      weight,
      height,
      allergies,
      habits,
      patientId: { id: patient._id }, // Use patient's ID directly
      createdBy: {
        id: user.id,
        username: user.username,
      },
    });

    const savedHealthinfo = await newHealthinfo.save();

    // Add the new health info to the patient
    patient.Healthinfo = patient.Healthinfo || [];
    patient.Healthinfo.push(savedHealthinfo._id);
    await patient.save();

    return NextResponse.json({
      message: "Healthinfo created successfully",
      success: true,
      data: savedHealthinfo,
    });
 } } catch (error) {
    console.error("Error creating Healthinfo:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Retrieve health information for a patient
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
 

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Find the patient by ID and populate Healthinfo
    const patient = await Patient.findById(id).populate('Healthinfo').exec();
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" });
    }

    

    // If the patient has no medical findings, return an empty array
    if (!patient.Healthinfo || patient.Healthinfo.length === 0) {
      return NextResponse.json({ message: "No Healthinfo available for this patient", data: [] });
    }

    // Sort medical findings by createdAt field in descending order
    const sortedFindingsHealth = patient.Healthinfo.sort((a: Healthinfo, b: Healthinfo) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Return the sorted medical findings
    return NextResponse.json({
      message: "Healthinfo retrieved successfully",
      success: true,
      data: sortedFindingsHealth,
    });
  } catch (error) {
    console.error("Error retrieving Healthinfo:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
