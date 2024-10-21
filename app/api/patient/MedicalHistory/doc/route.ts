import { NextRequest, NextResponse } from "next/server";
import Patient from '@/app/(models)/Patient';
import MedicalFinding from '@/app/(models)/MedicalFinding'; // Import the MedicalFinding model
import { authorizedMiddleware } from '@/app/helpers/authentication';

export async function GET(request: NextRequest) {
  await authorizedMiddleware(request);
  try {
    const user = request['user'];
    if (!user) {
      console.error("User is not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const createdBy = user.id;

    if (!createdBy) {
      console.error("CreatedBy username is required");
      return NextResponse.json({ error: "CreatedBy username is required" }, { status: 400 });
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    

    const recentMedicalFindings = await MedicalFinding.find({
      'createdBy.id': createdBy,
      createdAt: { $gte: threeDaysAgo }
    }).exec();

    

    if (recentMedicalFindings.length === 0) {
   
      return NextResponse.json({ message: "No recent medical findings available for this user", data: [] });
    }

    const patientIds = recentMedicalFindings.map(finding => finding.patientId.id);
    
    const patients = await Patient.find({
      _id: { $in: patientIds }
    }).exec();

    

    // Combine patient data with their medical findings
    const patientsWithFindings = patients.map(patient => {
      const findings = recentMedicalFindings.filter(finding => 
        finding.patientId.id.toString() === patient._id.toString()
      );
      return {
        ...patient.toObject(),
        MedicalFinding: findings
      };
    });

    return NextResponse.json({
      message: "Patients and medical findings retrieved successfully",
      success: true,
      data: patientsWithFindings,
    });
  } catch (error) {
    console.error("Error retrieving patients and medical findings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}






