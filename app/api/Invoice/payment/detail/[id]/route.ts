
import {connect} from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import {authorizedMiddleware} from "@/app/helpers/authentication"

import Invoice from '@/app/(models)/Invoice';


connect(); 



export async function GET(request: NextRequest, ) {
    await authorizedMiddleware(request);
    try {
     
      const body = await request.json(); // Assuming the invoiceId is in the JSON body
      const { invoiceId } = body;
      
      
      if (!invoiceId) {
        return NextResponse.json({ error: "invoice ID is required" }, { status: 400 });
      }
  
      const invoice = await Invoice.findById({ _id: invoiceId });
  
      if (!invoice) {
        return NextResponse.json({ error: "invoice not found" }, { status: 404 });
      }
  
      return NextResponse.json(invoice);
    } catch (error: unknown) {
      console.error("Error in GET /api/invoice/payment/detail:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }




  export async function DELETE(request: NextRequest) {
    // Authorization check
     authorizedMiddleware(request);
    
  
    try {
      // Parse the request body to get the invoiceId
      const body = await request.json(); // Assuming the invoiceId is in the JSON body
      const { invoiceId } = body;
  
      if (!invoiceId) {
        return NextResponse.json({ error: "Finding ID is required" }, { status: 400 });
      }
  
      // Find and delete the medical finding by ID
      const deletedFinding = await Invoice.findByIdAndDelete(invoiceId).exec();
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


  // Function to handle PATCH requests
 // Function to handle PATCH requests
export async function PATCH(request: NextRequest) {
  // Use the authorized middleware to check authentication
  await authorizedMiddleware(request);

  try {
    const body = await request.json(); // Parse the request body
    const { InvoiceId, ...data } = body; // Extract InvoiceId and the data to update

    if (!InvoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    // Find and update the invoice by ID
    const updatedInvoice = await Invoice.findByIdAndUpdate(InvoiceId, data, { new: true }).exec();
    if (!updatedInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Invoice updated successfully",
      success: true,
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
  

