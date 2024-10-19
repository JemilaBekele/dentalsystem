import {  NextResponse } from 'next/server';
import User from "@/app/(models)/User";

export async function GET() {
  try {
    const doctors = await User.find({ role: 'doctor' }).exec();
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



