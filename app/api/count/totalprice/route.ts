import { NextResponse } from 'next/server';
import Invoice from '@/app/(models)/Invoice'; // Adjust the path to your Invoice model

export async function GET() {
  try {
    // Fetch all invoices
    const invoices = await Invoice.find();

    // Calculate total balance from all invoices
    const totalBalance = invoices.reduce((total, invoice) => total + invoice.balance, 0);

    

    // Return the combined results
    return NextResponse.json({
      message: 'Invoices retrieved successfully',
      success: true,
      data: {
            // Sum of total paid from all invoices
        totalBalance,  // Sum of balances from all invoices
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ message: 'Failed to retrieve invoices.', success: false }, { status: 500 });
  }
}
