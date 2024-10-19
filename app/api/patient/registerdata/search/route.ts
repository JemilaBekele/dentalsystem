import { NextRequest, NextResponse } from 'next/server';
import Patient from "@/app/(models)/Patient";

interface Query {
  cardno?: string; // exact match for cardno
  phoneNumber?: { $regex: string; $options: string }; // optional regex for phone
}

// Extract search parameters outside of the try-catch block
const getSearchParams = (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const cardno = searchParams.get('cardno');
  const phoneNumber = searchParams.get('phoneNumber');
  return { cardno, phoneNumber };
};

export async function GET(request: NextRequest) {
  // Get the search parameters
  const { cardno, phoneNumber } = getSearchParams(request);

  // Initialize the query object
  const query: Query = {};

  try {
    // Build the query based on provided parameters
    if (cardno) {
      query.cardno = cardno; // Exact match for cardno
    }
    if (phoneNumber) {
      query.phoneNumber = { $regex: phoneNumber, $options: 'i' }; // Case-insensitive search for phone number
    }

    // Check if no parameters were provided
    if (!cardno && !phoneNumber) {
      return NextResponse.json(
        { error: 'At least one search parameter (cardno or phone) is required' },
        { status: 400 }
      );
    }

    // Query the Patient model with the constructed query
    const patients = await Patient.find(query).exec();

    // Check if patients were found
    if (!patients || patients.length === 0) {
      return NextResponse.json(
        { error: "No patients found" },
        { status: 404 }
      );
    }

    // Return the found patients
    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
