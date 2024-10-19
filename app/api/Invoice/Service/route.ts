import { NextRequest, NextResponse } from 'next/server';

import Service from '@/app/(models)/Services';

export async function POST(req: NextRequest) {
 // Ensure MongoDB connection

  try {
    const { service, price } = await req.json(); // Parse the request body

    // Validate request
    if (!service || !price) {
      return NextResponse.json({ message: 'Service and price are required' }, { status: 400 });
    }

    // Check if the service already exists
    const existingService = await Service.findOne({ service });
    if (existingService) {
      return NextResponse.json({ message: 'Service already exists' }, { status: 400 });
    }

    // Create new service
    const newService = new Service({
      service,
      price,
    });

    // Save service to the database
    await newService.save();

    // Send response
    return NextResponse.json(
      {
        message: 'Service registered successfully',
        service: newService,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle server errors
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


// GET method for fetching all services
export async function GET() {
    // Ensure MongoDB connection
  
    try {
      const services = await Service.find(); // Fetch all services from the database
  
      return NextResponse.json(services, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: 'Failed to fetch services'}, { status: 500 });
    }
  }