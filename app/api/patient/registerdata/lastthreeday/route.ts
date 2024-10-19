import Patient from "@/app/(models)/Patient";
import { NextRequest, NextResponse } from "next/server";
// Adjust the checkAuthenticationpath as needed
import {authorizedMiddleware} from "@/app/helpers/authentication"
import { subDays, startOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  const authrtoResponse = await authorizedMiddleware(request);
  if (authrtoResponse) {
    return authrtoResponse;
  }

  try {
    // Get today's date and subtract 2 days to get the start of the range
    const today = startOfDay(new Date()); // Start of today (00:00:00)
    const threeDaysAgo = subDays(today, 2); // 2 days ago at 00:00:00

    // Fetch patients registered within the last 3 days (including today)
    const patients = await Patient.find({
      createdAt: {
        $gte: threeDaysAgo, // Greater than or equal to three days ago
        $lt: new Date(),    // Less than now (to include today)
      },
    });

    return NextResponse.json(patients);
  } catch (error: unknown) {
    console.error("Error in GET /api/patient/registerdata", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
