"use client";

import React, { useState, useMemo  } from "react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
type HealthinfoFormProps = {
  params: {
    id: string;
  };
};

export default function HealthFindingForm({ params }: HealthinfoFormProps) {
  const patientId = params.id;
  const router = useRouter();
  const { data: session } = useSession(); 
  const [formData, setFormData] = useState({
    bloodgroup: "",
    weight: "",
    height: "",
    allergies: "",
    habits: "",  // Missing habits input added
  });
  const role = useMemo(() => session?.user?.role || '', [session]); 
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formMessage, setFormMessage] = useState<string | null>(null); // State for form message
  const [formType, setFormType] = useState<'success' | 'error' | null>(null); // State for message type

  // Function to validate form data
  const validateForm = () => {
    const formErrors: { [key: string]: string } = {};

    if (!formData.bloodgroup.trim()) {
      formErrors.bloodgroup = "Blood group is required.";
    }
    if (!formData.weight.trim()) {
      formErrors.weight = "Weight is required.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset previous messages
    setFormMessage(null);
    setFormType(null);

    // Validate form data
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`/api/patient/healthInfo/${patientId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to submit form: ${response.status} - ${errorText}`);
        setFormMessage("An error occurred while submitting the form.");
        setFormType('error');
      } else {
        console.log("Form submitted successfully");
        setFormMessage("Form submitted successfully!");
        setFormType('success');
        {role === 'doctor' && (
        router.push(`/doctor/medicaldata/healthinfo/all/${patientId}`))}
        {role === 'admin' && (
          router.push(`/admin/medicaldata/healthinfo/all/${patientId}`))}
      }
      
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormMessage("An unexpected error occurred. Please try again.");
      setFormType('error');
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="flex m-7">
      <div className="flex-grow md:ml-60 container mx-auto p-4">
        <div className="flex space-x-8">
          {/* Patient Details */}
          <div className="w-1/3 p-4">
            <PatientComponent params={params} />
          </div>

          {/* Medical Findings Form */}
          <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Health Information</h1>
            </div>

            {/* Form Submission */}
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="bloodgroup" className="block font-bold mb-2">
                  Blood Group
                </label>
                <select
                  id="bloodgroup"
                  name="bloodgroup"
                  value={formData.bloodgroup}
                  onChange={handleInputChange}
                  className={`border p-2 rounded-md w-full ${errors.bloodgroup ? "border-red-500" : ""}`}
                >
                  <option value="" disabled>Select Blood Group</option>
                  <option value="A+">A-positive</option>
                  <option value="A-">A-negative</option>
                  <option value="B+">B-positive</option>
                  <option value="B-">B-negative</option>
                  <option value="AB+">AB-positive</option>
                  <option value="AB-">AB-negative</option>
                  <option value="O+">O-positive</option>
                  <option value="O-">O-negative</option>
                </select>
                {errors.bloodgroup && <p className="text-red-500">{errors.bloodgroup}</p>}
              </div>

              <div className="mt-4">
                <label htmlFor="weight" className="block font-bold mb-2">
                  Weight
                </label>
                <input
                  id="weight"
                  name="weight"
                  type="text"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className={`border p-2 rounded-md w-full ${errors.weight ? "border-red-500" : ""}`}
                  placeholder="60kg"
                />
                {errors.weight && <p className="text-red-500">{errors.weight}</p>}
              </div>

              {/* Additional fields */}
              <div className="mt-4">
                <label htmlFor="height" className="block font-bold mb-2">
                  Height
                </label>
                <input
                  id="height"
                  name="height"
                  type="text"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="border p-2 rounded-md w-full"
                  placeholder="5.5ft"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="allergies" className="block font-bold mb-2">
                  Allergies
                </label>
                <input
                  id="allergies"
                  name="allergies"
                  type="text"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  className="border p-2 rounded-md w-full"
                  placeholder="beans, nuts"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="habits" className="block font-bold mb-2">
                  Habits
                </label>
                <input
                  id="habits"
                  name="habits"
                  type="text"
                  value={formData.habits}
                  onChange={handleInputChange}
                  className="border p-2 rounded-md w-full"
                  placeholder="smoking, drinking"
                />
              </div>

              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-300  mt-4">
                Submit
              </button>
            </form>

            {formMessage && (
              <p className={`mt-4 ${formType === 'success' ? 'bg-green-300 text-green-600' : 'bg-red-300 text-red-600'}`}>
                {formMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
