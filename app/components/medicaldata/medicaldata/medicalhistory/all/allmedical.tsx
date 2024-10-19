"use client";
import React, { useState, useEffect , useMemo} from "react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import EditMedicalRecordModal from "@/app/components/patient/EditMedicalRecordModal";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from 'next-auth/react';
type TreatmentPlan = {
  Exrtaction?: boolean;
    Scaling?: boolean;
    Rootcanal?: boolean;
    Filling?: boolean;
    Bridge?: boolean;
    Crown?: boolean;
    Apecectomy?: boolean;
    Fixedorthodonticappliance?: boolean;
    Removableorthodonticappliance?: boolean;
    Removabledenture?: boolean;
    other?: string;
};

type Vitalsign = {
  Core_Temperature?: string,
    Respiratory_Rate?: string,
    Blood_Oxygen?: string,
    Blood_Pressure?: string,
    heart_Rate?: string,
};
// Align the types for consistency
type MedicalRecordData = {
  _id: string;
  ChiefCompliance: string;
  Historypresent: string;
  Vitalsign: Vitalsign| null;
  Pastmedicalhistory: string;
  Pastdentalhistory: string;
  IntraoralExamination: string;
  ExtraoralExamination: string;
  Investigation: string;
  Assessment: string;
  TreatmentPlan: TreatmentPlan | null;
  TreatmentDone:TreatmentPlan | null; // Updated Treatment type to TreatmentPlan
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
  const [existingMedicalFindings, setExistingMedicalFindings] = useState<MedicalRecordData[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<MedicalRecordData | null>(null);
  const { data: session } = useSession();
  const role = useMemo(() => session?.user?.role || '', [session]);
  useEffect(() => {
    async function fetchMedicalFindings() {
      try {
        const response = await fetch(`/api/patient/MedicalHistory/${patientId}`);
        if (response.ok) {
          const result = await response.json();
          console.log('Fetched data:', result);
          setExistingMedicalFindings(result.data);
        } else {
          console.error("Failed to fetch medical findings");
        }
      } catch (error) {
        console.error("Error fetching medical findings:", error);
      }
    }

    fetchMedicalFindings();
  }, [patientId]);

  const handleEdit = (finding: MedicalRecordData) => {
    const updatedFinding = { ...finding, TreatmentPlan: finding.TreatmentPlan || null };
    setSelectedFinding(updatedFinding);
    setIsEditOpen(true);
  };

  // Helper function to display only true treatment values
 // Helper function to display only true treatment values
 const renderTreatment = (treatmentPlan: TreatmentPlan | null, treatmentDone: TreatmentPlan | null) => { 
  const formatTreatment = (treatment: TreatmentPlan | null) => {
    if (!treatment) return "No Treatment"; // Check for null treatment

    const trueTreatments = Object.keys(treatment)
      .filter((key) => treatment[key as keyof TreatmentPlan] === true)
      .map((key) => key.replace(/([A-Z])/g, ' $1').trim());

    // If there are no true treatments and no 'other' specified
    if (trueTreatments.length === 0 && !treatment.other) return "No Treatment";

    // Add 'other' to the treatments if it exists
    if (treatment.other) {
      trueTreatments.push(`Other: ${treatment.other}`);
    }

    // Format treatments with correct spacing
    const formattedTreatments = trueTreatments.map(treatment => {
      // Adding spaces between the words for specific treatments
      return treatment
      .replace("Exrtaction", "Extraction")
        .replace("Fixedorthodonticappliance", "Fixed orthodontic appliance")
        .replace("Removableorthodonticappliance", "Removable orthodontic appliance")
        .replace("Removabledenture", "Removable denture");
    });

    return formattedTreatments.join(", "); // Join treatments with a comma and space
  };

  const plan = formatTreatment(treatmentPlan);
  const done = formatTreatment(treatmentDone);

  return `
    <strong>Treatment Plan:</strong><br>${plan !== "No Treatment" ? plan : "No Treatment"}<br>
    <strong>Treatment Done:</strong><br>${done !== "No Treatment" ? done : "No Treatment"}
  `;
};


  
  

  const handleCloseModal = () => {
    setIsEditOpen(false);
    setSelectedFinding(null);
  };

  const handleUpdate = async (data: MedicalRecordData) => {
    if (!data._id) return; // Ensure the data has an ID to update
  
    try {
      const payload = { recordId: data._id, ...data }; // Ensure the recordId is included in the payload
  
      const response = await axios.patch(`/api/patient/MedicalHistory/detail/${data._id}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.data.success) {
        setExistingMedicalFindings((prevFindings) =>
          prevFindings.map((finding) => (finding._id === data._id ? response.data.data : finding))
        );
        console.log("Record updated successfully");
      } else {
        console.error("Failed to update the record:", response.data.error);
      }
    } catch (err) {
      console.error("Error updating record:", err);
    } finally {
      handleCloseModal();
    }
  };
  const handleDeleteConfirmation = (recordId: string) => {
    toast.warn(
      <div>
        <span>Are you sure you want to delete this record?</span>
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
        const response = await axios.delete(`/api/patient/MedicalHistory/detail/${recordId}`, {
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
         
          console.error("Failed to delete the record:", response.data.error);
        }
      } catch (err) {
        toast.error("Error deleting record.");
        console.error("Error deleting record:", err);
      } finally {
        toast.dismiss(); // Dismiss the confirmation toast after the operation
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
              <h1 className="text-2xl font-bold">Dental Record</h1>
              {role === 'admin' && (
                <>
                 <Link
                href={`/admin/medicaldata/medicalhistory/add/${patientId}`}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                New Record +
              </Link>
                </>
              )}
             {role === 'doctor' && (
                <>
                 <Link
                href={`/doctor/medicaldata/medicalhistory/add/${patientId}`}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                New Record +
              </Link>
                </>
              )}
            </div>

            {existingMedicalFindings.length === 0 ? (
              <p className="text-gray-500">No medical findings available.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {existingMedicalFindings.map((finding) => {
    return (
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
            <div className="flex-grow px-4">
  {finding.ChiefCompliance && (
    <p><strong>Complaint:</strong> {finding.ChiefCompliance}</p>
  )}
  {finding.Historypresent && (
    <p><strong>History Present:</strong> {finding.Historypresent}</p>
  )}
  {finding.Vitalsign && (
    <div>
      <strong>Vital Signs:</strong>
      <ul>
        {finding.Vitalsign.Core_Temperature && (
          <li>Core Temperature: {finding.Vitalsign.Core_Temperature}</li>
        )}
        {finding.Vitalsign.Respiratory_Rate && (
          <li>Respiratory Rate: {finding.Vitalsign.Respiratory_Rate}</li>
        )}
        {finding.Vitalsign.Blood_Oxygen && (
          <li>Blood Oxygen: {finding.Vitalsign.Blood_Oxygen}</li>
        )}
        {finding.Vitalsign.Blood_Pressure && (
          <li>Blood Pressure: {finding.Vitalsign.Blood_Pressure}</li>
        )}
        {finding.Vitalsign.heart_Rate && (
          <li>Heart Rate: {finding.Vitalsign.heart_Rate}</li>
        )}
      </ul>
    </div>
  )}
  {finding.Pastmedicalhistory && (
    <p><strong>Past Medical History:</strong> {finding.Pastmedicalhistory}</p>
  )}
  {finding.Pastdentalhistory && (
    <p><strong>Past Dental History:</strong> {finding.Pastdentalhistory}</p>
  )}
  {finding.IntraoralExamination && (
    <p><strong>Intraoral Examination:</strong> {finding.IntraoralExamination}</p>
  )}
  {finding.ExtraoralExamination && (
    <p><strong>Extra Oral Examination:</strong> {finding.ExtraoralExamination}</p>
  )}
  {finding.Investigation && (
    <p><strong>Investigation:</strong> {finding.Investigation}</p>
  )}
  {finding.Assessment && (
    <p><strong>Assessment:</strong> {finding.Assessment}</p>
  )}
 <p dangerouslySetInnerHTML={{ __html: renderTreatment(finding.TreatmentPlan, finding.TreatmentDone) }} />
</div>

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
    );
})}

              </div>
            )}
          </div>
        </div>
        <EditMedicalRecordModal
          isOpen={isEditOpen}
          formData={selectedFinding}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        /><ToastContainer />
      </div>
    </div>
  );
}