"use client";

import { useState, useEffect } from 'react';
import DataTable from "@/app/components/ui/TableComponent";

import Modal from "@/app/components/invoice/detailinvoice";
import { EyeOutlined } from "@ant-design/icons";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button"
interface Invoice {
  _id: string;
  Invoice: {
    id: string;
    amount: number;
    receipt: boolean;
    created: {
      username: string;
      id: string;
    };
    customerName: {
      username: string;
      id: string;
      cardno: string;
    };
  };
  createdAt: string;
}

interface Card {
  _id: string;
  cardprice: number;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
  };
  patient: {
    id: {
      _id: string;
      cardno: string;
      firstname: string;
      age: string;
      sex: string;
    };
    username: string;
  };
}


interface Expense {
  _id: string;
  discription: string;
  amount: number;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
  };
 
}

interface Doctor {
  _id: string;
  username: string;
}

const FetchInvoices = () => {
  const [username, setUsername] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [receipt, setReceipt] = useState('true'); // New state for receipt filter
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isReceiptVisible, setIsReceiptVisible] = useState<boolean>(false);
  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/patient/doctor');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch doctors");
      }
      setDoctors(data);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setErrorMessage("Error fetching doctors");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleFetchInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username && (!startDate || !endDate)) {
      setErrorMessage('Either username or both start and end dates are required.');
      return;
    }

    try {
      const response = await fetch('/api/Invoice/payment/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, startDate, endDate, receipt: receipt !== '' ? receipt === 'true' : undefined }),
      });

      const data = await response.json();
     
      if (data.success) {
        setInvoices(data.data.history || []);
        setCards(data.data.cards || []);
        setExpenses(data.data.Expenses || []);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setErrorMessage('Failed to fetch invoices. Please try again.');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoiceId(invoice.Invoice.id);
    setIsModalOpen(true);
  };
  const handleToggleReceipt = () => {
    setIsReceiptVisible((prev) => !prev);
  };
  // Function to export to Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
  
    // Prepare invoice data
    const invoiceData = invoices.map(invoice => ({
      'Invoice ID': invoice.Invoice.id,
      'Patient Name': invoice.Invoice.customerName?.username || 'N/A',
      'Amount': invoice.Invoice.amount.toFixed(2),
      'Created By': `Dr ${invoice.Invoice.created?.username} `|| 'N/A',
      'Created At': new Date(invoice.createdAt).toLocaleDateString() || 'N/A',
    }));
  
    // Add invoice worksheet if there are invoices
    if (invoiceData.length > 0) {
      const invoiceWorksheet = XLSX.utils.json_to_sheet(invoiceData);
      
      XLSX.utils.book_append_sheet(workbook, invoiceWorksheet, 'Invoices');
    } else {
      console.log('No invoices to export.');
    }
  
    // Write the file
    XLSX.writeFile(workbook, 'Report_invoice.xlsx');
  };
  
  const exportToExcelcard = () => {
    const workbook = XLSX.utils.book_new();
  
    // Prepare card data
    const cardData = cards.map(card => ({
      'Card ID': card._id,
      'Patient Name': card.patient.username || 'N/A',
      'Card Price': card.cardprice.toFixed(2),
      'Created By': card.createdBy.username || 'N/A',
      'Created At': new Date(card.createdAt).toLocaleDateString() || 'N/A',
    }));
  
    // Add card worksheet if there are cards
    if (cardData.length > 0) {
      const cardWorksheet = XLSX.utils.json_to_sheet(cardData);
      
      XLSX.utils.book_append_sheet(workbook, cardWorksheet, 'Cards');
    } else {
      console.log('No cards to export.');
    }
  
    // Write the file
    XLSX.writeFile(workbook, 'Report_card.xlsx');
  };
  
  const exportToExpense = () => {
    const workbook = XLSX.utils.book_new();
  
    // Prepare expense data
    const expenseData = expenses.map(expense => ({
      'Expense ID': expense._id,
      'Description': expense.discription || 'N/A',
      'Amount': expense.amount.toFixed(2),
      'Created By': expense.createdBy.username || 'N/A',
      'Created At': new Date(expense.createdAt).toLocaleDateString() || 'N/A',
    }));
  
    // Add expense worksheet if there are expenses
    if (expenseData.length > 0) {
      const expenseWorksheet = XLSX.utils.json_to_sheet(expenseData);
      XLSX.utils.sheet_add_aoa(expenseWorksheet, [["Expense Report"]], { origin: "A1" });
  
      // Add the expense data starting from row 3 (leaving one row empty after the title)
      XLSX.utils.sheet_add_json(expenseWorksheet, expenseData, { origin: "A3" });
      XLSX.utils.book_append_sheet(workbook, expenseWorksheet, 'Expenses');
    } else {
      console.log('No expenses to export.');
    }
  
    // Write the file
    XLSX.writeFile(workbook, 'Report_expense.xlsx');
  };
  
  // Calculate totals
  const totalInvoiceAmount = invoices.reduce((total, invoice) => total + invoice.Invoice.amount, 0).toFixed(2);
  const totalCardPrice = cards.reduce((total, card) => total + card.cardprice, 0).toFixed(2);
  const totalexpenses = expenses.reduce((total, expenses) => total + expenses.amount, 0).toFixed(2);
  const grandTotal = (parseFloat(totalInvoiceAmount) + parseFloat(totalCardPrice) - parseFloat(totalexpenses)).toFixed(2);

  // Define columns for the Invoice DataTable
  const invoiceColumns = [
    
    {
      header: "Customer",
      key: "customerName.username" as keyof Invoice,
      render: (invoice: Invoice) => invoice.Invoice.customerName?.username || 'N/A',
    },
    {
      header: "Amount",
      key: "amount" as keyof Invoice,
      render: (invoice: Invoice) => invoice.Invoice.amount ? `${invoice.Invoice.amount.toFixed(2)}` : '0.00',
    },
    {
      header: "Created By",
      key: "created.username" as keyof Invoice,
      render: (invoice: Invoice) => invoice.Invoice.created?.username || 'N/A',
    },
    {
      header: "Created At",
      key: "createdAt" as keyof Invoice,
      render: (invoice: Invoice) => new Date(invoice.createdAt).toLocaleDateString() || 'N/A',
    },
    {
      header: "Action",
      key: "action" as keyof Invoice,
      render: (invoice: Invoice) => (
        <button aria-label="view detail" className="text-blue-600 hover:underline hover:bg-blue-200" onClick={() => handleViewInvoice(invoice)}>
          <EyeOutlined className="text-xl text-blue-500" />
        </button>
      ),
    },
  ];

  // Define columns for the Card DataTable
  const cardColumns = [
    
    {
      header: "Patient Name",
      key: "patient.username" as keyof Card,
      render: (card: Card) => card.patient.username || 'N/A',
    },
    {
      header: "Card Price",
      key: "cardprice" as keyof Card,
      render: (card: Card) => `${card.cardprice.toFixed(2)}`,
    },
    {
      header: "Created By",
      key: "createdBy.username" as keyof Card,
      render: (card: Card) => card.createdBy.username || 'N/A',
    },
    {
      header: "Created At",
      key: "createdAt" as keyof Card,
      render: (card: Card) => new Date(card.createdAt).toLocaleDateString() || 'N/A',
    },
  ];
  const expensesColumns = [
    
    {
      header: "Discription",
      key: "discription" as keyof Expense,
      render: (expense: Expense) => expense.discription || 'N/A',
    },
    {
      header: "Amount",
      key: "amount" as keyof Expense,
      render: (expense: Expense) => `${expense.amount.toFixed(2)}`,
    },
    {
      header: "Created By",
      key: "createdBy.username" as keyof Expense,
      render: (expense: Expense) => expense.createdBy.username || 'N/A',
    },
    {
      header: "Created At",
      key: "createdAt" as keyof Expense,
      render: (expense: Expense) => new Date(expense.createdAt).toLocaleDateString() || 'N/A',
    },
  ];
  return (
    <div className="flex ml-7 mt-7">
      <div className="flex-grow md:ml-60 container mx-auto">
        <div className="p-6 bg-white rounded shadow-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Invoice Report</h1>
          <form onSubmit={handleFetchInvoices} className="mb-4">
            <div className="mb-4">
              <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">Doctor Name:</label>
              <select
                id="doctor"
                name="doctor"
                className="border rounded-md w-full p-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor.username}>{doctor.username}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date:</label>
                <input
                  type="date"
                  id="startDate"
                  className="border rounded-md w-full p-2"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date:</label>
                <input
                  type="date"
                  id="endDate"
                  className="border rounded-md w-full p-2"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
              {/* Button to toggle receipt dropdown visibility */}
              <Button type="button" onClick={handleToggleReceipt} className="mb-4 mr-5">
              {isReceiptVisible ? "H" : "S"}
            </Button>

            {/* Conditional rendering of the receipt status dropdown */}
            {isReceiptVisible && (
              <div className="mb-4">
               
                <select
                  id="receipt"
                  name="receipt"
                  className="border rounded-md w-full p-2"
                  value={receipt}
                  onChange={(e) => setReceipt(e.target.value)}
                >
                  <option value="">-- Select Status --</option>
                  <option value="true">T</option>
                  <option value="false">F</option>
                </select>
              </div>
            )}
            <button type="submit" className="bg-blue-500 text-white rounded-md py-2 px-4">Fetch Invoices</button>
          </form>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          {invoices.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Invoices</h2>
              <DataTable data={invoices} columns={invoiceColumns} />
              <h3 className="mt-4">Total Amount: {totalInvoiceAmount}</h3>
            </div>
          )}
          {cards.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Cards</h2>
              <DataTable data={cards} columns={cardColumns} />
              <h3 className="mt-4">Total Card Price: {totalCardPrice}</h3>
            </div>
          )}
          {expenses.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Expenses</h2>
              <DataTable data={expenses} columns={expensesColumns} />
              <h3 className="mt-4">Total Expenses: {totalexpenses}</h3>
            </div>
          )}
          <h3 className="mt-4">Total Price: {grandTotal}</h3>
          {invoices.length > 0 || cards.length > 0 || expenses.length > 0 ? (
            <div className="mt-4">
              <Button onClick={exportToExcel} className=" mb-2 mx-10">Export Invoice to Excel</Button>
              <Button onClick={exportToExcelcard} className="mb-2 mx-10">Export Card to Excel</Button>
              <Button onClick={exportToExpense} className="mb-2 mx-10">Export Expense to Excel</Button>
            </div>
          ) : null}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} invoiceId={selectedInvoiceId} />
        </div>
      </div>
    </div>
  );
};

export default FetchInvoices;