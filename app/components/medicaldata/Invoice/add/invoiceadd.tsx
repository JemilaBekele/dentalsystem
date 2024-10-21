"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo  } from "react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import DataTable from "@/app/components/ui/TableComponent"; // Import Column type here
import { Column } from "@/types/types"; // Adjust the path as necessary
import { Button } from "@/components/ui/button"
// Use Column as before
import { useSession } from 'next-auth/react';
interface InvoiceItem {
  service: string;
  quantity: number;
  price: number;
  description?:string;
}

interface Service {
  _id: string;
  service: string;
  price: number;
}

interface Customer {
  id: string;
  username: string;
}

type InvoiceFormProps = {
  params: {
    id: string;
  };
};

export default function InvoiceForm({ params }: InvoiceFormProps) {
  const { data: session } = useSession(); 
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>([{ service: "", quantity: 1, price: 0, description: "" }]);
  const [customerName, setCustomerName] = useState<Customer>({ id: "", username: "" });
  const [currentpayment, setCurrentPayment] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const router = useRouter();
  const patientId = params.id;
  const role = useMemo(() => session?.user?.role || '', [session]); 
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/Invoice/Service");
        if (response.ok) {
          setServices(await response.json());
        }
      } catch (error) {
        console.error("Failed to fetch services", error);
      }
    };

    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patient/registerdata/${patientId}`);
        if (response.ok) {
          const patient = await response.json();
          setCustomerName({ id: patient._id, username: patient.firstname });
        }
      } catch (error) {
        console.error("Failed to fetch patient details", error);
      }
    };

    fetchServices();
    fetchPatient();
  }, [patientId]);

  const handleServiceChange = (index: number, serviceId: string) => {
    const selectedService = services.find((service) => service._id === serviceId);
    if (selectedService) {
      const updatedItems = [...items];
      updatedItems[index] = { ...updatedItems[index], service: selectedService._id, price: selectedService.price };
      setItems(updatedItems);
      calculateTotal(updatedItems);
    }
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedItems = [...items];
    const { name, value } = e.target;
    updatedItems[index] = { ...updatedItems[index], [name]: name === "quantity" || name === "price" ? Number(value) : value };
    setItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const addItem = () => setItems([...items, { service: "", quantity: 1, price: 0, description: "" }]);

  const calculateTotal = (updatedItems: InvoiceItem[]) => {
    const total = updatedItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
    setTotalAmount(total);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null); // Clear previous message before new submission
  
    if (currentpayment > totalAmount) {
      alert("Current Payment cannot be greater than Total Amount.");
      setLoading(false);
      return;
    }
  
    const invoiceData = {
      items: items.map((item) => ({
        ...item,
        totalPrice: item.quantity * item.price,
        description: item.description || '', // Ensures it's set to an empty string if not provided
      })),
      customerName,
      currentpayment,
      status: "order",
      confirm: false,
    };
  
    try {
      const response = await fetch(`/api/Invoice/payment/${patientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });
  
      if (response.ok) {
        setMessage({ text: "Invoice created successfully!", type: "success" });
        router.push(role === 'admin' ? `/admin/finace/Invoice/all/${patientId}` : `/doctor/Invoice/all/${patientId}`);
      } else {
        setMessage({ text: "Failed to create the invoice.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred while submitting the invoice.", type: "error" });
    } finally {
      setLoading(false);
    }
  };
  

  const columns: Column<InvoiceItem>[] = [
    {
      header: "Service",
      key: "service",
      render: (item: InvoiceItem) => (
        <select
          value={item.service}
          onChange={(e) => handleServiceChange(items.indexOf(item), e.target.value)}
          className="w-full  p-2 "
          aria-label="Select payment status" 
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service._id} value={service._id}>
              {service.service}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: "Description",
      key: "description",
      render: (item: InvoiceItem) => (
        <input
          type="text"
          name="description"
          value={item.description}
          onChange={(e) => handleItemChange(items.indexOf(item), e)}
          className="w-full  p-2 "
        />
      ),
    },
    {
      header: "Quantity",
      key: "quantity",
      render: (item: InvoiceItem) => (
        <input
          type="number"
          name="quantity"
          value={item.quantity}
          min="1"
          onChange={(e) => handleItemChange(items.indexOf(item), e)}
          className="w-full  p-2 "
        />
      ),
    },
    {
      header: "Unit Price",
      key: "price",
      render: (item: InvoiceItem) => (
        <input
          type="number"
          name="price"
          min="0"
          value={item.price}
          onChange={(e) => handleItemChange(items.indexOf(item), e)}
          className="w-full p-2 "
        />
      ),
    },
    
    {
      header: "Amount",
      key: "amount" as keyof InvoiceItem, // Cast to satisfy TypeScript
      render: (item: InvoiceItem) => (
        <span>{item.quantity * item.price}</span>
      ),
    },
  ];

  return (
    <div className="flex ml-7 mt-7">
      <div className="flex-grow md:ml-60 container mx-auto">
        <div className="flex space-x-4">
          <div className="w-1/3">
            <PatientComponent params={params} />
          </div>
          <div className="w-auto bg-white p-6 rounded-lg shadow-md">
            <header className="text-center mb-6">
              <h1 className="text-2xl font-bold">Add Invoice</h1>
              <p className="text-gray-600 capitalize">To: {customerName.username}</p>
            </header>

            <form onSubmit={handleSubmit}>
              <DataTable
                data={items}
                columns={columns}
                caption="Invoice Items"
                actions={(item) => (
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, i) => i !== items.indexOf(item)))} // Adjust delete logic
                    className="text-red-500 hover:text-red-700 transition"
                    aria-label="button of invoice" 
                  >
                    <DeleteOutlined />
                  </button>
                )}
              />

              <div className="text-center mb-4">
                
                <Button type="button" onClick={addItem} variant="ghost"><PlusOutlined />  Add</Button>
              </div>

              <div className="flex space-x-6 mb-4">
                <div>
                  <label className="font-bold">Current Payment:</label>
                  <input
                    type="number"
                    value={currentpayment}
                    onChange={(e) => setCurrentPayment(Number(e.target.value))}
                    className="border border-gray-100 p-2 rounded w-full"
                    
                  />
                </div>
                <div>
                  <label className="font-bold">Total Amount:</label>
                  <input
                    type="number"
                    value={totalAmount}
                    readOnly
                    className="border border-gray-100 p-2 rounded w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {loading ? "Submitting..." : "Submit Invoice"}
              </button>

              {message && (
                <p className={`mt-4 text-center ${message.type === "error" ? "bg-red-200 p-2 text-red-500" : "p-2 bg-green-300 text-green-500"}`}>
                  {message.text}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
