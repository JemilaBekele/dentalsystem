import { NextRequest, NextResponse } from 'next/server';
import MedicalFinding from '@/app/(models)/MedicalFinding';
import Patient from '@/app/(models)/Patient';
import { authorizedMiddleware } from '@/app/helpers/authentication';

interface MedicalFinding {
  createdAt: string; // or Date, depending on how you store it
  // Add other fields as needed
}
// Create a new medical finding 
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
 await authorizedMiddleware(request);
  
  

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "patient ID is required" }, { status: 400 });
    }

    if (typeof request === 'object' && request !== null && 'user' in request) {
      const user = (request as { user: { id: string; username: string } }).user; // Type assertion for user
      console.log("User Data:", user);

      const {
        ChiefCompliance,
  Historypresent,
  Vitalsign,
  Pastmedicalhistory,
  Pastdentalhistory,
  IntraoralExamination,
  ExtraoralExamination,
  Investigation,
  Assessment,
  TreatmentPlan,
  TreatmentDone
      } = await request.json();

      const createdBy = {
        id: user.id,
        username: user.username,
      };

      // Validate patient existence
      const patient = await Patient.findById(id).exec();
      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
      }

      // Create new MedicalFinding
      const newMedicalFinding = new MedicalFinding({
        ChiefCompliance,
        Historypresent,
        Vitalsign,
        Pastmedicalhistory,
        Pastdentalhistory,
        IntraoralExamination,
        ExtraoralExamination,
        Investigation,
        Assessment,
        TreatmentPlan,
        TreatmentDone,
        patientId: { id: patient._id },
        createdBy,
      });

      const savedFinding = await newMedicalFinding.save();
      if (!patient.MedicalFinding) {
        patient.MedicalFinding = [];
      }

      patient.MedicalFinding.push(savedFinding._id);
      await patient.save();

      return NextResponse.json({
        message: "Medical finding created successfully",
        success: true,
        data: savedFinding,
      });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error creating medical finding:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
 
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Find the patient by ID and populate MedicalFinding
    const patient = await Patient.findById(id).populate('MedicalFinding').exec();
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // If the patient has no medical findings, return an empty array
    if (!patient.MedicalFinding || patient.MedicalFinding.length === 0) {
      return NextResponse.json({ message: "No medical findings available for this patient", data: [] });
    }

    // Sort medical findings by createdAt field in descending order
    const sortedFindings = patient.MedicalFinding.sort((a: MedicalFinding, b: MedicalFinding) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Return the sorted medical findings
    return NextResponse.json({
      message: "Medical findings retrieved successfully",
      success: true,
      data: sortedFindings,
    });
  } catch (error) {
    console.error("Error retrieving medical findings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}