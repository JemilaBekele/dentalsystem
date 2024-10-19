import { NextRequest, NextResponse } from 'next/server';
import Card from '@/app/(models)/card';

import { authorizedMiddleware } from '@/app/helpers/authentication';


interface Card {
  createdAt: string; // or Date, depending on how you store it
  // Add other fields as needed
}


  
export async function PATCH(request: NextRequest) {
 await authorizedMiddleware(request);
    
  
    try {
      const body = await request.json(); // Parse the request body
      const { recordId, ...data } = body; // Extract recordId and updates
  
      if (!recordId) {
        return NextResponse.json({ error: "Finding ID is required" }, { status: 400 });
      }
  
      // Find and update the Card finding by ID
      const updatedFinding = await Card.findByIdAndUpdate(recordId, data, { new: true }).exec();
      if (!updatedFinding) {
        return NextResponse.json({ error: "Card finding not found" }, { status: 404 });
      }
  
      return NextResponse.json({
        message: "Card finding updated successfully",
        success: true,
        data: updatedFinding,
      });
    } catch (error) {
      console.error("Error updating Card finding:", error);
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
      const deletedFinding = await Card.findByIdAndDelete(recordId).exec();
      if (!deletedFinding) {
        return NextResponse.json({ error: "Card finding not found" }, { status: 404 });
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