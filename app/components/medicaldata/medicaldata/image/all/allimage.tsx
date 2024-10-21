"use client";

import React, { useEffect, useState , useMemo} from "react";
import Image from "next/image";
import Link from "next/link";
import PatientComponent from "@/app/components/patient/PatientComponent";
import axios from "axios";
import { DeleteOutlined } from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from 'next-auth/react';
import PopupImage from "../PopupImage";
// Define the types for the patient and images
type PatientImage = {
  _id: string;
  image?: string | null; // Main image URL
  imagetwo?: string | null; // Additional image
  imagethree?: string | null; // Another additional image
  description?: string;
};

type PatientData = {
  _id: string;
  name: string;
  Image: PatientImage[];
};

type PatientImagesProps = {
  params: {
    id: string;
  };
};

export default function PatientImages({ params }: PatientImagesProps) {
  const patientId = params.id;
  const { data: session } = useSession();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = useMemo(() => session?.user?.role || '', [session]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // Fetch patient data and images when the component is mounted
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch(`/api/patient/image/${patientId}`);
        const data = await response.json();
        console.log("Fetched data:", data); // Debugging fetched data

        if (response.ok) {
          // Ensure you're setting patientData correctly
          setPatientData({
            _id: patientId, // Include patient ID
            name: "Patient Name", // Set or fetch the actual patient name as needed
            Image: data.data || [], // Set the images array, default to an empty array
          });
        } else {
          setError(data.error || "An error occurred while fetching patient data.");
        }
      } catch (err) {
        setError("An error occurred while fetching patient data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleDeleteConfirmation = (imageId: string) => {
    toast.warn(
      <div>
        <span>Are you sure you want to delete this image?</span>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <button onClick={() => handleDelete(imageId)}>Yes</button>
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
  const handleDelete =async (imageId: string) => {
    
      try {
        const response = await axios.delete(`/api/patient/image/detail/${imageId}`, {
          data: { imageId },
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Delete response:", response.data); // Debugging line

        // Check for success
        if (response.data && response.data.success) {
          setPatientData((prevData) => ({
            ...prevData!,
            Image: prevData!.Image.filter((image) => image._id !== imageId),
          }));
          toast.success("Image deleted successfully!");
        } else {
          // Handle error response
          toast.error(response.data.error || "");
          window.location.reload();
        }
      } catch (err) {
        console.error(err); // Log the error for debugging
        toast.error("An unexpected error occurred while deleting the image.");
      }
   
  };
  const handleImageClick = (imageId: string) => {
    setSelectedImage(imageId);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedImage(null);
  };
  // Check if the data is loading
  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  // Check for an error
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  // Check for patient data
  if (!patientData) {
    return <div className="text-center">No patient data found.</div>;
  }

  // Render the patient images if they exist
  return (
    <div className="flex mt-30 m-7">
      <div className="flex-grow md:ml-60 container mx-auto p-4">
        <div className="flex space-x-8">
          <div className="w-1/3 p-4">
            <PatientComponent params={params} />
          </div>
          <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Images</h1>
              {role === 'admin' && (
                <>
                <Link
                href={`/admin/medicaldata/image/add/${patientId}`}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                New Image +
              </Link>
                </>
              )}
              {role === 'doctor' && (
                <>
                <Link
                href={`/doctor/medicaldata/image/add/${patientId}`}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                New Image +
              </Link>
                </>
              )}
              {role === 'doctor' && (
                <>
                <Link
                href={`/doctor/medicaldata/image/add/${patientId}`}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                New Image +
              </Link>
                </>
              )}
              {role === 'doctor' && (
                <>
                <Link
                href={`/doctor/medicaldata/image/add/${patientId}`}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                New Image +
              </Link>
                </>
              )}
              {role === 'reception' && (
                <>
                <Link
                href={`/reception/image/add/${patientId}`}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                New Image +
              </Link>
                </>
              )}
              
            </div>

            {patientData.Image && patientData.Image.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {patientData.Image.map((image) => (
                  <div key={image._id} className="relative shadow-lg rounded-lg overflow-hidden">
                  {image.image && (
                    <Image
                      src={image.image}
                      alt={image.description || "Patient Image"}
                      width={300}
                      height={300}
                      className="object-cover"
                    />
                  )}
                  {image.imagetwo && (
                    <Image
                      src={image.imagetwo}
                      alt={image.description || "Patient Image Two"}
                      width={300}
                      height={300}
                      className="object-cover"
                    />
                  )}
                  {image.imagethree && (
                    <Image
                      src={image.imagethree}
                      alt={image.description || "Patient Image Three"}
                      width={300}
                      height={400}
                      className="object-cover"
                    />
                  )}
                  {image.description && (
                    <div className="absolute bottom-0 bg-black bg-opacity-50 text-white p-2">
                      {image.description}
                    </div>
                  )}
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteConfirmation(image._id)}
                    aria-label="Delete image"
                    title="Delete image" 
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    <DeleteOutlined />
                  </button>
                  
                  {/* View Button */}
                  <button
                    onClick={() => handleImageClick(image._id)}
                    aria-label="View image"
                    title="View image" 
                    className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    View
                  </button>
                </div>
                
                ))}
              </div>
            ) : (
              <div>No images found for this patient.</div>
            )}
            <ToastContainer />
          </div>
        </div>
      </div> {isPopupOpen && selectedImage && (
        <PopupImage imageId={selectedImage} onClose={handleClosePopup} />
      )}
    </div>
  );
}