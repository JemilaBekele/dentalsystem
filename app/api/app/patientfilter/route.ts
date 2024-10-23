import { NextRequest, NextResponse } from 'next/server';
import Patient from "@/app/(models)/Patient"; // Adjust the import according to your file structure

// Define a type for the query object
type Query = {
  firstname?: { $regex: RegExp };
  createdAt?: { $gte: Date; $lte: Date };
};

export async function POST(req: NextRequest) {
  // Parse the request body
  const { firstName, date } = await req.json();

  try {
    // Define query object with more specific typing
    const query: Query = {};

    if (firstName) {
      query.firstname = { $regex: new RegExp(firstName, 'i') }; // Case-insensitive search
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999); // Set end date to the end of the day

      query.createdAt = { $gte: startDate, $lte: endDate }; // Filter for the entire day
    }

    const patients = await Patient.find(query).exec();

    return NextResponse.json({ data: patients }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
