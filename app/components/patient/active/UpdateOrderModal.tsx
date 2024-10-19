import React, { useEffect, useState } from "react";

interface OrderUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

type Doctor = {
  _id: string;
  username: string;
};

const OrderUpdateModal: React.FC<OrderUpdateModalProps> = ({ isOpen, onClose, orderId }) => {
  const [status, setStatus] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]); // Changed to an array of Doctor
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Fetch order details when the modal opens
  useEffect(() => {
    const fetchOrder = async () => {
      setFetching(true);
      setError(null);

      try {
        const response = await fetch(`/api/patient/order/orderlist/active/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch order details");
        }

        // Set the status and selected doctor from fetched order data
        setStatus(data.order.status);
        const assignedDoctor = data.order.assignedDoctorTo;
        setSelectedDoctor(assignedDoctor ? { _id: assignedDoctor.id, username: assignedDoctor.username } : null);

      } catch (err) {
        setError("Error fetching order data");
      } finally {
        setFetching(false);
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/patient/doctor'); // Adjust the endpoint as needed
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch doctors");
        }
        setDoctors(data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Error fetching doctors");
      }
    };

    if (isOpen) {
      fetchOrder();
      fetchDoctors(); // Fetch doctors when the modal opens
    }
  }, [isOpen, orderId]);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    
    if (!selectedDoctor) {
      setError("Please select a doctor before updating the order.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/patient/order/orderlist/active/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId, 
          status, 
          assignedDoctorTo: { 
            id: selectedDoctor._id, // Valid doctor ID
            username: selectedDoctor.username // Selected doctor's username
          }
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update order");
      }
      setMessage({ text: "Order updated successfully!", type: "success" });
      onClose(); // Close the modal
    } catch (err) {
      setError("Error updating order");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-1/3">
        <h2 className="text-xl font-bold mb-4">Update Order Status</h2>
        {fetching ? (
          <div>Loading order details...</div>
        ) : error ? (
          <div className="text-red-500 mb-2">{error}</div>
        ) : (
          <>
            <div className="mt-4">
              <label className="block mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded w-full p-2"
                aria-label="Select order status"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block mb-2">Assign Doctor</label>
              <select
                id="doctor"
                name="doctor"
                aria-label="Select doctor" 
                value={selectedDoctor?._id || ''}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const doctor = doctors.find(doctor => doctor._id === selectedId);
                  setSelectedDoctor(doctor || null); // Set the selected doctor
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.username}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className="mt-4 flex justify-end">
          <button className="mr-2 text-gray-500" onClick={onClose}>Cancel</button>
          <button
            className="bg-blue-500 text-white rounded px-4 py-2"
            onClick={handleUpdate}
            disabled={loading || fetching}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
        {message && (
          <p className={`mt-4 text-center ${message.type === "error" ? "bg-red-200 p-2 text-red-500" : "p-2 bg-green-300 text-green-500"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderUpdateModal;