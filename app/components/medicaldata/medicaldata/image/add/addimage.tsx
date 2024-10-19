"use client";

import React, { useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import PatientComponent from "@/app/components/patient/PatientComponent";
import Image from "next/image";
import { useSession } from 'next-auth/react';
type ImageFormProps = {
  params: {
    id: string;
  };
};

export default function ImageForm({ params }: ImageFormProps) {
  const patientId = params.id;
  const router = useRouter();
  const { data: session } = useSession(); 
  const [errors] = useState<{ [key: string]: string }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [borderColor, setBorderColor] = useState("border-gray-300"); // Border color state
  const [showPopup, setShowPopup] = useState(false); // Popup state
  const role = useMemo(() => session?.user?.role || '', [session]); 
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    droppedFiles.forEach((file, index) => {
      const inputName = index === 0 ? "image" : index === 1 ? "imagetwo" : "imagethree";
      formData.append(inputName, file);
    });

    try {
      const response = await fetch(`/api/patient/image/${patientId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to submit form: ${response.status} - ${errorText}`);
      } else {
        setFormSubmitted(true);
        {role === 'doctor' && (
        router.push(`/doctor/medicaldata/image/all/${patientId}`))}
        {role === 'admin' && (
          router.push(`/admin/medicaldata/image/all/${patientId}`))}
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Handle input change for manual uploads
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setDroppedFiles((prev) => [...prev, file]);
      setImagePreviews((prev) => [...prev, URL.createObjectURL(file)]);
      showNotification(); // Show popup and change border color
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const droppedFilesArray = Array.from(files);
      setDroppedFiles((prev) => [...prev, ...droppedFilesArray]);

      droppedFilesArray.forEach((file) => {
        setImagePreviews((prev) => [...prev, URL.createObjectURL(file)]);
      });
      showNotification(); // Show popup and change border color
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setDroppedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Prevent default behavior when dragging over the drop area
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Trigger file input click when drop area is clicked
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Show popup and temporarily change border color
  const showNotification = () => {
    setShowPopup(true);
    setBorderColor("border-green-500"); // Change border color to green

    setTimeout(() => {
      setShowPopup(false); // Hide popup after 3 seconds
      setBorderColor("border-gray-300"); // Reset border color
    }, 3000); // Duration of popup and color change
  };

  return (
    <div className="flex m-7">
      <div className="flex-grow md:ml-60 container mx-auto p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-8">
            <div className="w-1/3 p-4">
              <PatientComponent params={params} />
            </div>

            <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Upload Images</h2>
              <div
                className={`bg-blue-100 border-dashed border-2 ${borderColor} p-6 mb-4 cursor-pointer shadow-lg rounded-lg transition duration-300`} // Box styling
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={handleClick} // Click event to trigger file input
              >
                <p className="text-center text-gray-500">Drag and drop images here or click to upload</p>
                <input
                  type="file"
                  name="image"
                  id="image"
                  ref={fileInputRef}
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="imagetwo" className="block mb-2">Image 2:</label>
                <input
                  type="file"
                  name="imagetwo"
                  id="imagetwo"
                  onChange={handleInputChange}
                  className="border p-2 rounded-lg shadow-md w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="imagethree" className="block mb-2">Image 3:</label>
                <input
                  type="file"
                  name="imagethree"
                  id="imagethree"
                  onChange={handleInputChange}
                  className="border p-2 rounded-lg shadow-md w-full"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300">
                Submit
              </button>
              {formSubmitted && <p className="mt-4 text-green-500">Images uploaded successfully!</p>}
              {errors && <p className="text-red-500">{errors.general}</p>}

              {/* Image Previews with Remove Button */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      width={500}
                      height={500}
                      className="rounded-lg shadow-md object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      onClick={() => handleRemoveImage(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Popup notification */}
        {showPopup && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg">
            <p>Image added successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}
