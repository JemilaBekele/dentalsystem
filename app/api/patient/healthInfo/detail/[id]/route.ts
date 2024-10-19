import { NextRequest, NextResponse } from 'next/server';
import Healthinfo from '@/app/(models)/healthinfo';
import Patient from "@/app/(models)/Patient";
import { authorizedMiddleware } from '@/app/helpers/authentication';


interface Healthinfo {
  createdAt: string; // or Date, depending on how you store it
  // Add other fields as needed
}
// Create a new medical finding
export async function GET(request: NextRequest, { params }: { params: { patientId: string; recordId: string } }) {
    
  
    try {
      const { patientId, recordId } = params;
      if (!patientId || !recordId) {
        return NextResponse.json({ error: "Patient ID and Finding ID are required" }, { status: 400 });
      }
      const patient = await Patient.findById(patientId).exec();
      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
      }
  
      // Find the medical finding by ID
      const finding = await Healthinfo.findById(recordId).exec();
      if (!finding) {
        return NextResponse.json({ error: "Medical finding not found" }, { status: 404 });
      }
  
      return NextResponse.json({
        message: "Medical finding retrieved successfully",
        success: true,
        data: finding,
      });
    } catch (error) {
      console.error("Error retrieving medical finding:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  
  export async function PATCH(request: NextRequest) {
 await authorizedMiddleware(request);
    
  
    try {
      const body = await request.json(); // Parse the request body
      const { recordId, ...data } = body; // Extract recordId and updates
  
      if (!recordId) {
        return NextResponse.json({ error: "Finding ID is required" }, { status: 400 });
      }
  
      // Find and update the medical finding by ID
      const updatedFinding = await Healthinfo.findByIdAndUpdate(recordId, data, { new: true }).exec();
      if (!updatedFinding) {
        return NextResponse.json({ error: "Medical finding not found" }, { status: 404 });
      }
  
      return NextResponse.json({
        message: "Medical finding updated successfully",
        success: true,
        data: updatedFinding,
      });
    } catch (error) {
      console.error("Error updating medical finding:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
  

  

  export async function DELETE(request: NextRequest) {
    // Authorization check
     authorizedMiddleware(request);
    
  
    try {
      // Parse the request body to get the recordId
      const body = await request.json(); // Assuming the recordId is in the JSON body
      const { recordId } = body;
  
      if (!recordId) {
        return NextResponse.json({ error: "Finding ID is required" }, { status: 400 });
      }
  
      // Find and delete the medical finding by ID
      const deletedFinding = await Healthinfo.findByIdAndDelete(recordId).exec();
      if (!deletedFinding) {
        return NextResponse.json({ error: "Medical finding not found" }, { status: 404 });
      }
  
      // Optionally, remove the finding reference from the associated patient
      // (You can add code here if you have references to update in related documents)
  
      return NextResponse.json({
        message: "Medical finding deleted successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error deleting medical finding:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }