import { connect } from "@/app/lib/mongodb";
import {  NextResponse } from 'next/server';
import Patient from "@/app/(models)/Patient";
import Order from "@/app/(models)/Order";


connect();

export async function GET() {
  try {
    const activeOrders = await Order.find({
      // Adjust field as needed
      status: 'Active',
    }).exec();

    if (!activeOrders || activeOrders.length === 0) {
      // Instead of returning a 404, return a 200 with a message saying no active orders exist
      return NextResponse.json({
        message: "No active orders found",
        success: true,
        data: [],  // Return an empty list as no active orders were found
      }, { status: 200 });
    }

    // Extract patient IDs from active orders
    const patientIds = activeOrders.map(order => order.patientId.id);
   

    // Fetch patients based on the extracted IDs
    const patients = await Patient.find({ _id: { $in: patientIds } }).populate('Order').exec();
   

    // Return patients with their associated orders
    const patientsWithOrders = patients.map(patient => ({
      _id: patient._id,
      firstname: patient.firstname,
      cardno: patient.cardno,
      orders: patient.Order,  // Return the existing order IDs from the patient document
    }));

    return NextResponse.json({
      message: "Patients with orders retrieved successfully",
      success: true,
      data: patientsWithOrders,
    });

  } catch (error) {
    console.error("Error in GET /api/patient/order/orderlist/active", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
