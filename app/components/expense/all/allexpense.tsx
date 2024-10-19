import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button"; 
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

// Define the Expense interface
interface Expense {
  _id: string;
  amount: number;
  discription: string;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
  };
}

const ExpenseReport: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null); // State for the expense to update
  const [updatedAmount, setUpdatedAmount] = useState<number>(0);
  const [updatedDescription, setUpdatedDescription] = useState<string>("");

  // Fetch expenses based on start and end date
  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/Expense/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!response.ok) throw new Error("Failed to fetch expenses");

      const data = await response.json();
      if (data.success) {
        setExpenses(data.data.expense || []);
      } else {
        setError(data.message || "No data found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return;
    try {
      const response = await fetch(`/api/Expense/detail/${expenseId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expeId: expenseId }),
      });

      if (!response.ok) throw new Error("Failed to delete expense");

      setExpenses((prevExpenses) => prevExpenses.filter((exp) => exp._id !== expenseId));
      
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleUpdateExpense = async () => {
    if (!currentExpense) return;

    try {
      const response = await fetch(`/api/Expense/detail/${currentExpense._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expeId: currentExpense._id,
          amount: updatedAmount,
          discription: updatedDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to update expense");

      // Refresh the expense list
      fetchExpenses();
      setIsModalOpen(false); // Close the modal after updating
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const openModal = (expense: Expense) => {
    setCurrentExpense(expense);
    setUpdatedAmount(expense.amount);
    setUpdatedDescription(expense.discription);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExpense(null);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchExpenses();
  }, [startDate, endDate]);

  return (
    <div className="mt-24 ml-0 lg:ml-60 w-full max-w-4xl lg:max-w-[calc(100%-15rem)] mx-auto p-5 rounded-lg">
      <h1 className="text-xl font-bold mb-5">Expense Report</h1>
      
      <form className="mb-5">
        <div className="flex gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date:</label>
            <input
              type="date"
              id="startDate"
              className="border rounded-md p-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date:</label>
            <input
              type="date"
              id="endDate"
              className="border rounded-md p-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <button type="button" onClick={fetchExpenses} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">
          Fetch Expenses
        </button>
      </form>

      <Table>
        <TableCaption>A list of expenses.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map(({ _id, discription, amount, createdBy, createdAt }) => (
            <TableRow key={_id}>
              <TableCell>{discription}</TableCell>
              <TableCell>{amount.toFixed(2)}</TableCell>
              <TableCell>{createdBy.username}</TableCell>
              <TableCell>{new Date(createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="ghost" className="mr-2" onClick={() => openModal({ _id, discription, amount, createdBy, createdAt })}>
                  <EditOutlined className="text-blue-500" />
                </Button>
                <Button variant="ghost" className="mr-2" onClick={() => handleDeleteExpense(_id)}>
                  <DeleteOutlined className="text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal for updating expense */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">Update Expense</h2>
            <div className="mb-4">
              <label htmlFor="updateDescription" className="block text-sm font-medium text-gray-700">Description:</label>
              <input
                type="text"
                id="updateDescription"
                className="border rounded-md p-2 w-full"
                value={updatedDescription}
                onChange={(e) => setUpdatedDescription(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="updateAmount" className="block text-sm font-medium text-gray-700">Amount:</label>
              <input
                type="number"
                id="updateAmount"
                className="border rounded-md p-2 w-full"
                value={updatedAmount}
                onChange={(e) => setUpdatedAmount(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-400 text-white py-2 px-4 rounded-md mr-2"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-md"
                onClick={handleUpdateExpense}
              >
                Update Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseReport;
