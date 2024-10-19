"use client";

import React, { useState, useMemo   } from "react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
type MedicalFindingFormProps = {
  params: {
    id: string;
  };
};
type Vitalsign = {
  Core_Temperature: string;
  Respiratory_Rate: string;
  Blood_Oxygen: string;
  Blood_Pressure: string;
  heart_Rate: string;
};

type TreatmentPlan = {
  Exrtaction: boolean;
  Scaling: boolean;
  Rootcanal: boolean;
  Filling: boolean;
  Bridge: boolean;
  Crown: boolean;
  Apecectomy: boolean;
  Fixedorthodonticappliance: boolean;
  Removableorthodonticappliance: boolean;
  Removabledenture: boolean;
  other: string;
};

type FormData = {
  ChiefCompliance: string;
  Historypresent: string;
  Vitalsign: Vitalsign;
  Pastmedicalhistory: string;
  Pastdentalhistory: string;
  IntraoralExamination: string;
  ExtraoralExamination: string;
  Investigation: string;
  Assessment: string;
  TreatmentPlan: TreatmentPlan;
  TreatmentDone: TreatmentPlan; // If TreatmentDone has the same structure as TreatmentPlan
};

const InputField = ({
  label,
  id,
  name,
  value,
  onChange,
  isTextArea = false,
  rows = 1,
  error = "",
}: {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isTextArea?: boolean;
  rows?: number;
  error?: string;
}) => (
  <div className="mt-4">
    <label htmlFor={id} className="block font-bold mb-2">
      {label}
    </label>
    {isTextArea ? (
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`border p-2 rounded-md w-full ${error ? "border-red-500" : ""}`}
        rows={rows}
      />
    ) : (
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`border p-2 rounded-md w-full ${error ? "border-red-500" : ""}`}
      />
    )}
    {error && <p className="text-red-500">{error}</p>}
  </div>
);

const CheckboxField = ({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex items-center mb-2">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="mr-2"
    />
    <label>{label}</label>
  </div>
);

export default function MedicalFindingForm({ params }: MedicalFindingFormProps) {
  const patientId = params.id;
  const router = useRouter();
  const { data: session } = useSession(); 
  const role = useMemo(() => session?.user?.role || '', [session]); 
  const [formData, setFormData] =useState<FormData>({
    ChiefCompliance: "",
    Historypresent: "",
    Vitalsign: {
      Core_Temperature: "",
      Respiratory_Rate: "",
      Blood_Oxygen: "",
      Blood_Pressure: "",
      heart_Rate: "",
    },
    Pastmedicalhistory: "",
    Pastdentalhistory: "",
    IntraoralExamination: "",
    ExtraoralExamination: "",
    Investigation: "",
    Assessment: "",
    TreatmentPlan: {
      Exrtaction: false,
      Scaling: false,
      Rootcanal: false,
      Filling: false,
      Bridge: false,
      Crown: false,
      Apecectomy: false,
      Fixedorthodonticappliance: false,
      Removableorthodonticappliance: false,
      Removabledenture: false,
      other: "",
    },
    TreatmentDone: {
      Exrtaction: false,
      Scaling: false,
      Rootcanal: false,
      Filling: false,
      Bridge: false,
      Crown: false,
      Apecectomy: false,
      Fixedorthodonticappliance: false,
      Removableorthodonticappliance: false,
      Removabledenture: false,
      other: "",
    },
  });

  
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Function to validate form data
  

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    

    try {
      const response = await fetch(`/api/patient/MedicalHistory/${patientId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Form submitted successfully");
        setFormSubmitted(true);
        {role === 'doctor' && (
        router.push(`/doctor/medicaldata/medicalhistory/all/${patientId}`))}

        {role === 'admin' && (
          router.push(`/admin/medicaldata/medicalhistory/all/${patientId}`))}
      } else {
        console.error("Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
  
    // Handling Vital Signs
    if (name in formData.Vitalsign) {
      setFormData((prevData) => ({
        ...prevData,
        Vitalsign: {
          ...prevData.Vitalsign,
          [name]: value,
        },
      }));
    } 
    // Handling Treatment Plan and Treatment Done
    else if (name.startsWith("TreatmentPlan.") || name.startsWith("TreatmentDone.")) {
      const [category, field] = name.split(".");
      
      // Check if category is either TreatmentPlan or TreatmentDone
      if (category === "TreatmentPlan" || category === "TreatmentDone") {
        setFormData((prevData) => ({
          ...prevData,
          [category]: {
            ...prevData[category],
            [field]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
          },
        }));
      }
    } 
    // Handling other form fields
    else if (name in formData) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
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
              <h1 className="text-2xl font-bold">Dental Record</h1>
            </div>

            {/* Form Submission */}
            <form onSubmit={handleSubmit}>
              <InputField
                label="Chief Complaint"
                id="ChiefCompliance"
                name="ChiefCompliance"
                value={formData.ChiefCompliance}
                onChange={handleInputChange}
                isTextArea
                rows={3}
                
              />

              <InputField
                label="History of Present Illness"
                id="Historypresent"
                name="Historypresent"
                value={formData.Historypresent}
                onChange={handleInputChange}
                isTextArea
                rows={3}
                
              />

              {/* Vital Signs */}
              <div className="mt-4">
                <h2 className="font-bold mb-2">Vital Signs</h2>
                {Object.entries(formData.Vitalsign).map(([key, value]) => (
                  <InputField
                    key={key}
                    label={key.replace(/_/g, " ")}
                    id={key}
                    name={key}
                    value={value}
                    onChange={handleInputChange}
                  />
                ))}
              </div>

              <InputField
                label="Past Medical History"
                id="Pastmedicalhistory"
                name="Pastmedicalhistory"
                value={formData.Pastmedicalhistory}
                onChange={handleInputChange}
                isTextArea
                rows={3}
              />

              <InputField
                label="Past Dental History"
                id="Pastdentalhistory"
                name="Pastdentalhistory"
                value={formData.Pastdentalhistory}
                onChange={handleInputChange}
                isTextArea
                rows={3}
              />

              <InputField
                label="Intra Oral Examination"
                id="IntraoralExamination"
                name="IntraoralExamination"
                value={formData.IntraoralExamination}
                onChange={handleInputChange}
                isTextArea
                rows={3}
              />

              <InputField
                label="Extra Oral Examination"
                id="ExtraoralExamination"
                name="ExtraoralExamination"
                value={formData.ExtraoralExamination}
                onChange={handleInputChange}
                isTextArea
                rows={3}
              />

              <InputField
                label="Investigations"
                id="Investigation"
                name="Investigation"
                value={formData.Investigation}
                onChange={handleInputChange}
                isTextArea
                rows={3}
              />

              <InputField
                label="Assessment"
                id="Assessment"
                name="Assessment"
                value={formData.Assessment}
                onChange={handleInputChange}
                isTextArea
                rows={3}
              />

              {/* Treatment Plan */}
              <div className="mt-4">
                <h2 className="font-bold mb-2">Treatment Plan</h2>
                <CheckboxField
                  label="Extraction"
                  name="TreatmentPlan.Exrtaction"
                  checked={formData.TreatmentPlan.Exrtaction}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Scaling"
                  name="TreatmentPlan.Scaling"
                  checked={formData.TreatmentPlan.Scaling}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Root Canal"
                  name="TreatmentPlan.Rootcanal"
                  checked={formData.TreatmentPlan.Rootcanal}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Filling"
                  name="TreatmentPlan.Filling"
                  checked={formData.TreatmentPlan.Filling}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Bridge"
                  name="TreatmentPlan.Bridge"
                  checked={formData.TreatmentPlan.Bridge}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Crown"
                  name="TreatmentPlan.Crown"
                  checked={formData.TreatmentPlan.Crown}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Apecectomy"
                  name="TreatmentPlan.Apecectomy"
                  checked={formData.TreatmentPlan.Apecectomy}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Fixed Orthodontic Appliance"
                  name="TreatmentPlan.Fixedorthodonticappliance"
                  checked={formData.TreatmentPlan.Fixedorthodonticappliance}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Removable Orthodontic Appliance"
                  name="TreatmentPlan.Removableorthodonticappliance"
                  checked={formData.TreatmentPlan.Removableorthodonticappliance}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Removable Denture"
                  name="TreatmentPlan.Removabledenture"
                  checked={formData.TreatmentPlan.Removabledenture}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Other Treatment"
                  id="TreatmentPlan.other"
                  name="TreatmentPlan.other"
                  value={formData.TreatmentPlan.other}
                  onChange={handleInputChange}
                />
              </div>

              {/* Treatment Done */}
              <div className="mt-4">
                <h2 className="font-bold mb-2">Treatment Done</h2>
                <CheckboxField
                  label="Extraction"
                  name="TreatmentDone.Exrtaction"
                  checked={formData.TreatmentDone.Exrtaction}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Scaling"
                  name="TreatmentDone.Scaling"
                  checked={formData.TreatmentDone.Scaling}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Root Canal"
                  name="TreatmentDone.Rootcanal"
                  checked={formData.TreatmentDone.Rootcanal}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Filling"
                  name="TreatmentDone.Filling"
                  checked={formData.TreatmentDone.Filling}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Bridge"
                  name="TreatmentDone.Bridge"
                  checked={formData.TreatmentDone.Bridge}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Crown"
                  name="TreatmentDone.Crown"
                  checked={formData.TreatmentDone.Crown}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Apecectomy"
                  name="TreatmentDone.Apecectomy"
                  checked={formData.TreatmentDone.Apecectomy}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Fixed Orthodontic Appliance"
                  name="TreatmentDone.Fixedorthodonticappliance"
                  checked={formData.TreatmentDone.Fixedorthodonticappliance}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Removable Orthodontic Appliance"
                  name="TreatmentDone.Removableorthodonticappliance"
                  checked={formData.TreatmentDone.Removableorthodonticappliance}
                  onChange={handleInputChange}
                />
                <CheckboxField
                  label="Removable Denture"
                  name="TreatmentDone.Removabledenture"
                  checked={formData.TreatmentDone.Removabledenture}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Other Treatment"
                  id="TreatmentDone.other"
                  name="TreatmentDone.other"
                  value={formData.TreatmentDone.other}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  className="bg-green-400 hover:bg-green-600 text-white py-2 px-4 rounded"
                >
                  Submit
                </button>
                {formSubmitted && (
                  <p className="text-green-500 bg-green-200 P-2 mt-2">Form submitted successfully!</p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
