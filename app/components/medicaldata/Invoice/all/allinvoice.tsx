"use client"; // Ensures this component is client-side rendered

import React, { useEffect, useState, useMemo } from "react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import Link from "next/link";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import InvoiceEditModal from "@/app/components/invoice/InvoiceEditModal";
import { Invoice } from "@/types/invotwo"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from 'next-auth/react';

type InvoiceFormProps = {
  params: {
    id: string;
  };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "text-green-500 bg-green-100";
    case "Pending":
      return "text-yellow-500 bg-yellow-100";
    case "Cancel":
      return "text-red-500 bg-red-100";
    case "order":
      return "text-blue-500 bg-blue-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
};

export default function InvoiceAll({ params }: InvoiceFormProps) {
  const patientId = params.id;
  const { data: session } = useSession(); 
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const role = useMemo(() => session?.user?.role || '', [session]);

  useEffect(() => {
    // Define the fetchInvoices function inside useEffect to avoid redeclaration on every render
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`/api/Invoice/payment/${patientId}`);
        const data = await response.json();
        if (response.ok) {
          setInvoices(data.data);
        } else {
          setError(data.error || "Failed to fetch invoices");
        }
      } catch (error) {
        setError("Failed to fetch invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [patientId]); // patientId is a dependency since it may change

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setModalVisible(true);
  };

  const handleSave = (updatedInvoice: Partial<Invoice>) => {
    if (!selectedInvoice) return;

    // Update the invoice locally
    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv._id === selectedInvoice._id ? { ...inv, ...updatedInvoice } : inv
      )
    );
    setModalVisible(false);

    // Re-fetch invoices after updating
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`/api/Invoice/payment/${patientId}`);
        const data = await response.json();
        if (response.ok) {
          setInvoices(data.data);
        } else {
          setError(data.error || "Failed to fetch invoices");
        }
      } catch (error) {
        setError("Failed to fetch invoices");
      }
    };
    fetchInvoices();
  };

  const handleDelete = async (invoiceId: string) => {
    const confirmDelete = async () => {
      try {
        const response = await axios.delete(`/api/Invoice/payment/detail/${invoiceId}`, {
          data: { invoiceId },
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data.success) {
          setInvoices((prevInvoices) =>
            prevInvoices.filter((invoice) => invoice._id !== invoiceId)
          );
        } else {
          console.error("Error deleting user:");
        }
      } catch (err) {
        setError("Error deleting record: ");
      } finally {
        toast.dismiss(); // Dismiss the confirmation toast after the operation
      }
    };

    toast.warn(
      <div>
        <span>Are you sure you want to delete this Invoice?</span>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <button onClick={() => confirmDelete()}>Yes</button>
          <button onClick={() => toast.dismiss()}>No</button>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="flex ml-7 mt-7">
      <div className="flex-grow md:ml-60 container mx-auto">
        <div className="flex space-x-4">
          <div className="w-1/3">
            <PatientComponent params={params} />
          </div>
          <div className="w-2/3 bg-white p-8 rounded-lg shadow-md">
            <header className="text-center mb-6">
              <h1 className="text-3xl font-bold">Invoices</h1>
              <p className="text-gray-600 capitalize mt-1">
                {invoices.length > 0 ? invoices[0].customerName.username : "Patient"}
              </p>
            </header>

            <div className="mt-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Invoices</h2>
                {role === 'admin' && (
                  <Link
                    href={`/admin/finace/Invoice/add/${patientId}`}
                    className="bg-green-500 text-white mb-4 px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    New Invoice +
                  </Link>
                )}
                {role === 'doctor' && (
                  <Link
                    href={`/doctor/Invoice/add/${patientId}`}
                    className="bg-green-500 text-white mb-4 px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    New Invoice +
                  </Link>
                )}
              </div>
              {invoices.length === 0 ? (
                <p className="text-center text-gray-500">No invoices available for this patient.</p>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice._id}
                      className="p-6 border rounded-lg shadow bg-gray-50 hover:shadow-lg transition-shadow relative"
                    >
                       {(role === 'doctor' || role === 'admin') && (
                      <div className="absolute top-2 right-2 space-x-2">
                        <EditOutlined
                          onClick={() => handleEdit(invoice)}
                          className="text-blue-500 pr-4 pl-4 cursor-pointer hover:text-blue-700"
                          aria-label="Edit Invoice"
                        />
                        <DeleteOutlined
                          onClick={() => handleDelete(invoice._id)}
                          className="text-red-500 cursor-pointer hover:text-red-700"
                          aria-label="Delete Invoice"
                        />
                      </div>)}

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <strong className="text-gray-700">Invoice Date:</strong>{" "}
                          <span className="text-gray-900">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <strong className="text-gray-700">Total Amount:</strong>{" "}
                          <span className="text-gray-900">{invoice.totalAmount.toFixed(2)}</span>
                        </div>
                        <div>
                          <strong className="text-gray-700">Total Paid:</strong>{" "}
                          <span className="text-gray-900">{invoice.totalpaid.toFixed(2)}</span>
                        </div>
                        <div>
                          <strong className="text-gray-700">Balance:</strong>{" "}
                          <span className="text-gray-900">{invoice.balance.toFixed(2)}</span>
                        </div>
                        <div>
                          <strong className="text-gray-700">Current Payment:</strong>{" "}
                          <span className="text-gray-900">{invoice.currentpayment.amount.toFixed(2)}</span>
                        </div>
                        <div>
                          <strong className="text-gray-700">Created By:</strong>{" "}
                          <span className="text-gray-900">{invoice.createdBy?.username || "Unknown"}</span>
                        </div>
                        <div>
                          <strong className="text-gray-700">Status:</strong>{" "}
                          <span className={`text-sm font-bold py-1 px-3 rounded ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Items</h3>
        <div className="overflow-y-auto h-48">
          <ul className="space-y-3">
            {invoice?.items.map((item, index) => (
              <li key={index} className="flex justify-between items-start bg-gray-100 p-3 rounded-lg shadow-sm">
                <div>
                  <div className="font-medium text-gray-800">
                    {item.service.service} (x{item.quantity})
                  </div>
                  <div className="text-gray-600">Description: {item.description}</div>
                  <div className="text-gray-600">Price per unit: {item.price.toFixed(2)}</div>
                </div>
                <span className="text-lg font-bold text-gray-800">{item.totalPrice.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
                      <InvoiceEditModal
                        visible={isModalVisible}
                        onClose={() => setModalVisible(false)}
                        invoice={selectedInvoice}
                        onSave={handleSave}
                        patientId={patientId}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
