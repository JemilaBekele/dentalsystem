import { NextRequest, NextResponse } from 'next/server';
import Service from '@/app/(models)/Services';
import Invoice from '@/app/(models)/Invoice';
import Patient from '@/app/(models)/Patient';
import { authorizedMiddleware } from '@/app/helpers/authentication';

interface Invoices {
  createdAt: string; // or Date, depending on how you store it
  // Add other fields as needed
}
// Define interfaces for request body types
interface InvoiceItem {
  service: string; // ObjectId as string
  description: string;
  quantity: number;
  price: number; // This should represent the price of the service
  
}

interface CustomerName {
  id: string; // Patient ObjectId as string
  username: string; 
  cardno:  string// Patient Name
}

interface CreateInvoiceRequest {
  items: InvoiceItem[];
  customerName: CustomerName;
  currentpayment: {
    amount: number;
    date: Date;
    confirm: boolean;
    receipt: boolean;
  };
  status: 'Paid' | 'Pending' | 'Cancel' | 'order';
  confirm: boolean ;
  createdBy: {
    userId: string; // Adjust according to your user reference schema
    username: string;
    
  };// Status type
}

// Function to handle POST requests
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // Use the authorized middleware to check authentication
  await authorizedMiddleware(request);

  try {
    // Extract patient ID from the URL parameters
    const { id } = params; // Use request.nextUrl to get URL parameters

    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    if (typeof request === 'object' && request !== null && 'user' in request) {
        const user = (request as { user: { id: string; username: string } }).user;
        console.log("User Data:", user);

    // Fetch patient details
    const patient = await Patient.findById(id).exec();
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Parse the incoming request body
    const body: CreateInvoiceRequest = await request.json();

    // Extract the necessary fields from the body
    const { items, customerName, currentpayment, status } = body;

    // Check if required fields are provided
    if (!items || !customerName || currentpayment === undefined || !status) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // Validate the status field
    const validStatuses = ['Paid', 'Pending', 'Cancel','order'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status value." }, { status: 400 });
    }

    // Check if all services referenced exist in the Service collection
    const servicesIds = items.map(item => item.service);
    const services = await Service.find({ '_id': { $in: servicesIds } });
    const serviceMap = new Map(services.map(service => [service._id.toString(), service]));

    // Validate services
    for (const item of items) {
      const serviceExists = serviceMap.get(item.service);
      if (!serviceExists) {
        return NextResponse.json({ message: `Service with id ${item.service} not found.` }, { status: 404 });
      }
    }

    // Create the new invoice
    const newInvoice = new Invoice({
      items: items.map(item => ({
        service: {
          id: serviceMap.get(item.service)?._id,
          service: serviceMap.get(item.service)?.service,
        },
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        
      })),
      customerName: {
        id: patient._id, // Patient ObjectId
        username: patient.firstname,
        cardno: patient.cardno // Patient Name
      },
      
      currentpayment:  {
        amount: currentpayment               
      }, // The amount paid immediately
      status: status, 
      
      createdBy: {
        id: user.id,
      username: user.username,
    },// Set the status of the invoice (Paid, Pending, Cancel,order)
    });

    // Save the new invoice
    

    const savedInvoice = await newInvoice.save();

      // Add the new appointment to the patient's record
      patient.Invoice = patient.Invoice || [];
      patient.Invoice.push(savedInvoice._id);
      await patient.save();

    // Respond with the newly created invoice
    return NextResponse.json({ invoice: savedInvoice }, { status: 201 });
  }} catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
 await authorizedMiddleware(request);
 

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Find the patient by ID and populate Invoice
    const patient = await Patient.findById(id).populate('Invoice').exec();
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
// Check if the populated data is correct
console.log("Patient's health information:", patient.Invoice);
    // If the patient has no medical findings, return an empty array
    if (!patient.Invoice || patient.Invoice.length === 0) {
      return NextResponse.json({ message: "No Invoice available for this patient", data: [] });
    }

    // Sort medical findings by createdAt field in descending order
    const sortedFindingsInvoice = patient.Invoice.sort((a: Invoices, b: Invoices) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
   

    // Return the sorted medical findings
    return NextResponse.json({
      message: "Invoice retrieved successfully",
      success: true,
      data: sortedFindingsInvoice,
    });
  } catch (error) {
    console.error("Error retrieving Invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}