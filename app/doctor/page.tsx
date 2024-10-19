"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CodeOutlined, EditOutlined } from '@ant-design/icons';
import OrderUpdateModal from '@/app/components/patient/active/UpdateOrderModal';

type Patient = {
  _id: string;
  firstname: string;
  sex: string;
  Order: Array<string>; // Ensure Order is always an array
};

const Home: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patient/order/orderlist');
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        console.log(data.patients);
        if (Array.isArray(data.patients)) {
          setPatients(data.patients.map((patient: Patient) => {
            const { _id, firstname, sex, Order = [] } = patient; // Default orders to an empty array
            return { _id, firstname, sex, Order }; // Include orders in the patient object
          }));
        } else {
          throw new Error('No patients found');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
        console.error('Error fetching patients:', error);
      }
    };

    // Fetch data initially
    fetchPatients();

    // Set interval for refreshing data every 10 seconds
    const intervalId = setInterval(fetchPatients, 20000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const handleEditOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrderId(null);
  };

  return (
    <div className="mt-24 ml-0 lg:ml-60 w-full max-w-4xl lg:max-w-[calc(100%-15rem)] mx-auto p-5 rounded-lg">
      <h1 className="text-xl font-bold mb-5">Patients</h1>
      {error && <div className="text-gray-500">{error}</div>}
      <Table>
        <TableCaption>A list of patients with active orders.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Edit Order</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map(({ _id, firstname, sex, Order }) => (
            <TableRow key={_id}>
              <TableCell>{firstname}</TableCell>
              <TableCell>{sex}</TableCell>
              <TableCell>
                <Link href={`/doctor/medicaldata/medicalhistory/all/${_id}`}>
                  <CodeOutlined className="text-2xl text-gray-600 hover:bg-slate-900 group-hover:text-white" />
                </Link>
              </TableCell>
              <TableCell>
                {Order.length > 0 && (
                  <button 
                    onClick={() => handleEditOrder(Order[0])} 
                    className="ml-2 text-blue-600 hover:bg-slate-500"
                    aria-label="click the edit button" 
                  >
                    <EditOutlined />
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedOrderId && (
        <OrderUpdateModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          orderId={selectedOrderId} 
        />
      )}
    </div>
  );
};

export default Home;
