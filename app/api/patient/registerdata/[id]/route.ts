import {connect} from "@/app/lib/mongodb";
import Patient from "@/app/(models)/Patient";
import { NextRequest, NextResponse } from "next/server";
import {authorizedMiddleware} from "@/app/helpers/authentication"
connect();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
 
    try {
     
      const { id } = params;
      
      if (!id) {
        return NextResponse.json({ error: "patient ID is required" }, { status: 400 });
      }
  
      const patient = await Patient.findById({ _id: id });
  
      if (!patient) {
        return NextResponse.json({ error: "patient not found" }, { status: 404 });
      }
  
      return NextResponse.json(patient);
    } catch (error: unknown) {
      console.error("Error in GET /api/patient/registerdata:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  authorizedMiddleware(request);
    try {
      
      const { id } = params;
      
      if (!id) {
        return NextResponse.json({ error: "patient ID is required" }, { status: 400 });
      }
  
      const patient = await Patient.findByIdAndDelete(id);
  
      if (!patient) {
        return NextResponse.json({ error: "patient not found" }, { status: 404 });
      }
  
      return NextResponse.json({ message: "patient deleted successfully" });
    } catch (error: unknown) {
      console.error("Error in DELETE /api/patient/registerdata:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  authorizedMiddleware(request);
    try {
    
      const { id } = params;
      const body = await request.json();
      
      if (!id) {
        return NextResponse.json({ error: "patient ID is required" }, { status: 400 });
      }
  
      const updatedPatient = await Patient.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  
      if (!updatedPatient) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      return NextResponse.json(updatedPatient);
    } catch (error: unknown) {
      console.error("Error in PATCH /api/patient/registerdata:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }  