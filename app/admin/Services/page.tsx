"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import ServicesPage from "@/app/components/admin/service";

type Service = {
  id?: string; // Optional _id
  service: string;
  price: number;
};

const ServiceForm = () => {
  const [serviceData, setServiceData] = useState<Service>({
    service: "",
    price: 0,  // Initialize price as a number
  });

  const [services, setServices] = useState<Service[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("/api/Invoice/Service");
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServiceData({
      ...serviceData,
      [name]: name === "price" ? Number(value) : value,  // Convert price to a number
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/Invoice/Service", serviceData);
      if (response.status === 201) {
        setMessage("Service added successfully!");
        setServiceData({ service: "", price: 0 });  // Reset price to 0, not an empty string

        setServices((prevServices) => [...prevServices, response.data.service]);
      } else {
        setMessage("Failed to add service.");
      }
    } catch (error) {
      setMessage("Error adding service.");
      console.error(error);
    }
  };

  return (
    <div className="bg-gray-100 p-5 rounded-lg mt-13 ml-0 lg:ml-60 w-full max-w-4xl lg:max-w-[calc(100%-15rem)] mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Add New Service</h2>

        {message && <p className="mb-4 text-green-500">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700">
              Service Name
            </label>
            <input
              type="text"
              name="service"
              value={serviceData.service}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={serviceData.price}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Service
            </button>
          </div>
        </form>
      </div>

      <ServicesPage services={services} setServices={setServices} />
    </div>
  );
};

export default ServiceForm;
