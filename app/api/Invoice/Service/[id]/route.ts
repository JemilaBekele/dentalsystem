import { NextRequest, NextResponse } from 'next/server';
import Service from '@/app/(models)/Services';

// POST method for creating a new service


// PATCH method for updating a service by its ID
export async function PATCH(req: NextRequest) {
  const { id, service, price } = await req.json(); // Parse request body
  
  // Validate inputs
  if (!id || (!service && !price)) {
    return NextResponse.json({ message: 'Service ID and at least one field (service or price) are required' }, { status: 400 });
  }

  try {
    // Find and update the service by its ID
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { service, price },
      { new: true } // Return the updated document
    );

    if (!updatedService) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Service updated successfully', service: updatedService }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update service' }, { status: 500 });
  }
}

// DELETE method for removing a service by its ID
export async function DELETE(req: NextRequest) {
  const { id } = await req.json(); // Parse request body

  // Validate inputs
  if (!id) {
    return NextResponse.json({ message: 'Service ID is required' }, { status: 400 });
  }

  try {
    // Find and delete the service by its ID
    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Service deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete service' }, { status: 500 });
  }
}
