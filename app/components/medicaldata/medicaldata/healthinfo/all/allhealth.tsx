"use client";

import React, { useState, useEffect, useMemo } from "react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import EditHealthRecordModal from "@/app/components/patient/EditHealthRecordModal";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from 'next-auth/react';
// Align the types for consistency
type MedicalRecordData = {
  _id: string;
  bloodgroup: string;
  weight: string;
  height: string;
  allergies: string;
  habits: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { username: string };
};

type MedicalFindingFormProps = {
  params: {
    id: string;
  };
};

export default function MedicalFindingForm({ params }: MedicalFindingFormProps) {
  const patientId = params.id;
  const { data: session } = useSession();
  const [existingMedicalFindings, setExistingMedicalFindings] = useState<MedicalRecordData[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<MedicalRecordData | null>(null);
  const role = useMemo(() => session?.user?.role || '', [session]);
  useEffect(() => {
    async function fetchMedicalFindings() {
      try {
        const response = await fetch(`/api/patient/healthInfo/${patientId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        if (result.success) {
          setExistingMedicalFindings(result.data);
        } else {
          console.error("No data found:", result.message);
        }
      } catch (error) {
        console.error("Error fetching medical findings:", error);
      }
    }

    fetchMedicalFindings();
  }, [patientId]);

  const handleEdit = (finding: MedicalRecordData) => {
    const updatedFinding = { ...finding };
    setSelectedFinding(updatedFinding);
    setIsEditOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditOpen(false);
    setSelectedFinding(null);
  };

  const handleUpdate = async (data: MedicalRecordData) => {
    if (!data._id) return;

    try {
      const payload = { recordId: data._id, ...data };
      const response = await axios.patch(`/api/patient/healthInfo/detail/${data._id}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setExistingMedicalFindings((prevFindings) =>
          prevFindings.map((finding) => (finding._id === data._id ? response.data.data : finding))
        );
        toast.success("Record updated successfully!");
      } else {
        toast.error(response.data.error || "Failed to update the record.");
      }
    } catch (err) {
      console.error("Error updating record:", err);
      toast.error("An unexpected error occurred while updating the record.");
    } finally {
 
      handleCloseModal();

    }
  };

  const handleDeleteConfirmation = (recordId: string) => {
    toast.warn(
      <div>
        <span>Are you sure you want to delete this Health Information?</span>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <button onClick={() => handleDelete(recordId)}>Yes</button>
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

  const handleDelete = async (recordId: string) => {
    
    try {
      const response = await axios.delete(`/api/patient/healthInfo/detail/${recordId}`, {
        data: { recordId },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setExistingMedicalFindings((prevFindings) =>
          prevFindings.filter((finding) => finding._id !== recordId)
        );
        toast.success("Health Information deleted successfully!");
      } else {
        toast.error(response.data.error || "Error deleting Health Information");
      }
    } catch (err) {
      console.error("Error deleting record:", err);
      toast.error("An unexpected error occurred while deleting the record.");
    }finally {
 
      toast.dismiss();

    }
  };

  return (
    <div className="flex m-7">
      <div className="flex-grow md:ml-60 container mx-auto p-4">
        <div className="flex space-x-8">
          <div className="w-1/3 p-4">
            <PatientComponent params={params} />
          </div>
          <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Health Information</h1>
              {role === 'admin' && (
                <>
                 <Link
                href={`/admin/medicaldata/healthinfo/add/${patientId}`}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                New Health Information +
              </Link>
                </>
              )}
              {role === 'doctor' && (
                <>
              <Link
                href={`/doctor/medicaldata/healthinfo/add/${patientId}`}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                New Health Information +
              </Link></>
              )}
            </div>

            {existingMedicalFindings.length === 0 ? (
              <p className="text-gray-500">No medical findings available.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {existingMedicalFindings.map((finding) => (
                  <div key={finding._id} className="border p-4 rounded-lg shadow-md flex items-start justify-between">
                    <div className="flex flex-col space-y-2">
                      <div className="text-gray-600 text-sm p-2">
                        {new Date(finding.createdAt || '').toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-gray-600 text-sm p-2">
                        Dr: {finding.createdBy?.username || "Unknown"}
                      </div>
                    </div>
                    <div className="flex-grow px-4">
                      {finding.bloodgroup && <p><strong>Blood Group:</strong> {finding.bloodgroup}</p>}
                      {finding.weight && <p><strong>Weight:</strong> {finding.weight}</p>}
                      {finding.height && <p><strong>Height:</strong> {finding.height}</p>}
                      {finding.allergies && <p><strong>Allergies:</strong> {finding.allergies}</p>}
                      {finding.habits && <p><strong>Habits:</strong> {finding.habits}</p>}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        className="hover:bg-blue-300 p-2 rounded-full"
                        onClick={() => handleEdit(finding)}
                        aria-label="Edit medical record"
                        title="Edit medical record"
                      >
                        <EditOutlined className="text-xl text-blue-500" />
                      </button>
                      <button
                        className="hover:bg-red-300 p-2 rounded-full"
                        onClick={() => handleDeleteConfirmation(finding._id)}
                        aria-label="Delete medical record"
                        title="Delete medical record"
                      >
                        <DeleteOutlined className="text-xl text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <EditHealthRecordModal
          isOpen={isEditOpen}
          formData={selectedFinding}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
        <ToastContainer />
      </div>
    </div>
  );
}
