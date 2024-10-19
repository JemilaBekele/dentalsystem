"use client";

import React, { useState } from "react";
import DataTable from "@/app/components/ui/TableComponent";
import axios from "axios";
import EditServiceModal from "@/app/components/admin/editservice";

type Service = {
  _id?: string; // Optional _id
  service: string;
  price: number;
};

interface ServicesPageProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

const ServicesPage = ({ services, setServices }: ServicesPageProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsEditOpen(true);
  };

  const handleUpdate = async (data: Service) => {
    if (!data._id) return;
    const payload = { id: data._id, ...data };

    try {
      const response = await axios.patch(`/api/Invoice/Service/${data._id}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.service) {
        // Update services in the parent state
        setServices((prevServices) =>
          prevServices.map((service) => (service._id === data._id ? response.data.service : service))
        );
      } else {
        console.error("Failed to update service:", response.data?.message || "Unknown error");
      }
    } catch (err) {
      console.error("Error updating service:", err);
    } finally {
      setIsEditOpen(false);
      setSelectedService(null);
    }
  };

  const handleCloseModal = () => {
    setIsEditOpen(false);
    setSelectedService(null);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return; // Ensure that id exists before making the delete call
    if (confirm("Are you sure you want to delete this service?")) {
      setLoading(true);
      try {
        const response = await axios.delete(`/api/Invoice/Service/${id}`, {
          data: { id }, 
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.data.success) {
          // Update services in the parent state
          setServices((prevServices) => prevServices.filter((service) => service._id !== id));
        } else {
          throw new Error("Failed to delete service");
        }
      } catch (err) {
        console.error("Error deleting service:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    {
      header: "Service Name",
      key: "service" as keyof Service,
      render: (item: Service) => item.service,
    },
    {
      header: "Price",
      key: "price" as keyof Service,
      render: (item: Service) => `${item.price.toFixed(2)}`,
    },
  ];

  const actions = (item: Service) => (
    <>
      <button onClick={() => handleEdit(item)} className="text-blue-500 hover:underline">
        Edit
      </button>
      <button
        onClick={() => handleDelete(item._id)} // Check for undefined _id
        className="text-red-500 hover:underline ml-4"
        disabled={loading}
      >
        Delete
      </button>
    </>
  );

  return (
    <div>
      <h1>Service List</h1>
      <DataTable<Service>
        data={services}
        columns={columns}
        caption="List of available services"
        actions={actions}
      />
      <EditServiceModal
        isOpen={isEditOpen}
        formData={selectedService}
        onClose={handleCloseModal}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default ServicesPage;
