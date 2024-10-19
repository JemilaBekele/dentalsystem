import { NextRequest, NextResponse } from 'next/server';
import Invoice from '@/app/(models)/Invoice'; // Adjust the path to your Invoice model
import History from '@/app/(models)/history'; 
import Card from '@/app/(models)/card';
import Expense from '@/app/(models)/expense'; // Import Card model
import { HistoryItem } from '@/types/history';

interface Query {
  'Invoice.created.username'?: string;
  'Invoice.receipt'?: boolean;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}




export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, startDate, endDate, receipt } = body; // Include receipt parameter

  if (!username && (!startDate || !endDate)) {
    return NextResponse.json({ message: 'Either username or both start and end dates are required.', success: false }, { status: 400 });
  }

  try {
    const query: Query = {};
    let startDateObj: Date | null = null;
    let endDateObj: Date | null = null;

    // Add username filter if provided
    if (username) {
      query['Invoice.created.username'] = username;
    }

    // Add date range filter if both startDate and endDate are provided
    if (startDate && endDate) {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        return NextResponse.json({ message: 'Invalid date format.', success: false }, { status: 400 });
      }

      if (endDateObj <= startDateObj) {
        return NextResponse.json({ message: 'End date must be greater than or equal to start date.', success: false }, { status: 400 });
      }

      endDateObj.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDateObj, $lte: endDateObj };
    }

    // Add receipt filter if provided
    if (receipt !== undefined) {
      query['Invoice.receipt'] = receipt; // Use the receipt filter
    }

    const history: HistoryItem[] = await History.find(query);

    let cards = [];
    let Expenses = [];
    if (!username) {
      cards = await Card.find({
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      });
      Expenses = await Expense.find({
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      });


    }

    return NextResponse.json({
      message: 'Invoices and cards retrieved successfully',
      success: true,
      data: {
        history,
        cards,
        Expenses
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching invoices and cards:', error);
    return NextResponse.json({ message: 'Failed to retrieve invoices and cards.', success: false }, { status: 500 });
  }
}




export async function GET() {
  try {
    // Correct the typo from `falsee` to `false`
    const invoices = await Invoice.find({
      'currentpayment.confirm': false, // Use quotes around the key
    });

    // Return the success response with status 200
    return NextResponse.json({
      message: 'Invoices retrieved successfully',
      success: true,
      data: invoices,
    }, { status: 200 });
  } catch (error) {
    // Log and return an error response with status 500
    console.error('Error fetching invoices:', error);
    return NextResponse.json({
      message: 'Failed to retrieve invoices.',
      success: false,
    }, { status: 500 });
  }
}

