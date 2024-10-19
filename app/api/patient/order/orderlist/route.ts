import { connect } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from 'next/server';
import Patient from "@/app/(models)/Patient";
import Order from "@/app/(models)/Order";
import {authorizedMiddleware} from "@/app/helpers/authentication"
connect();

export async function GET(request: NextRequest) {
  await authorizedMiddleware(request);
  try {
    // Check if the user is present in the request
    const user = request['user']; // Adjust based on your request handling for user authentication
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorId = user.id;

    // Fetch active orders for the doctor
    const activeOrders = await Order.find({
      'assignedDoctorTo.id': doctorId, // Adjust field as needed
      status: 'Active',
    }).exec();

    if (!activeOrders || activeOrders.length === 0) {
      return NextResponse.json({ message: "No active orders found" });
    }

    // Extract patient IDs from active orders
    const patientIds = activeOrders.map(order => order.patientId.id);

    // Fetch patients based on the extracted IDs
    const patients = await Patient.find({ _id: { $in: patientIds } }).exec();

    if (!patients || patients.length === 0) {
      return NextResponse.json({ message: "Patients not found" });
    }

   

    return NextResponse.json({
      message: "Patient profiles retrieved successfully",
      success: true,
      patients,
    });
  } catch (error) {
    console.error("Error in GET /api/patient/order/orderlist", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
