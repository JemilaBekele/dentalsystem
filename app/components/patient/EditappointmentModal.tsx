import React, { useState, useEffect } from "react";

// Align the types for consistency
type AppointmentData = {
  _id: string;
  appointmentDate: string;
  appointmentTime: string; // Added appointment time
  reasonForVisit: string;
  status: string;
  doctorId: { id: string; username: string };
  patientId: { id: string };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { username: string };
};

interface EditAppointmentModalProps {
  isOpen: boolean;
  formData: AppointmentData | null;
  onClose: () => void;
  onUpdate: (data: AppointmentData) => Promise<void>; // Allow async function here
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  formData,
  onClose,
  onUpdate,
}) => {
  const [localData, setLocalData] = useState<AppointmentData | null>(formData);
  const [doctors, setDoctors] = useState<{ _id: string; username: string }[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`/api/patient/doctor`);
        const data = await response.json();
        if (response.ok) {
          setDoctors(data);
        } else {
          console.error("Failed to fetch doctors");
        }
      } catch (err) {
        console.error("An error occurred while fetching doctors:", err);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    setLocalData(formData);
  }, [formData]);

  if (!isOpen || !localData) return null;

  const handleChange = (field: keyof AppointmentData, value: string | { id: string; username: string }) => {
    if (field === "doctorId") {
      setLocalData({ ...localData, doctorId: value as { id: string; username: string } });
    } else {
      setLocalData({ ...localData, [field]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    if (localData) {
      const selectedDate = new Date(localData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      if (selectedDate <= today) {
        setDateError("Appointment date must be in the future.");
        return;
      } else {
        setDateError(null);
      }
  
      // Combine date and time
      const [hours, minutes] = localData.appointmentTime.split(":");
      selectedDate.setHours(parseInt(hours), parseInt(minutes));
  
      const updatedData = {
        ...localData,
        appointmentDate: selectedDate.toISOString(), // or your desired format
      };
  
      onUpdate(updatedData);
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Appointment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-bold mb-2" htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={localData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="border p-2 rounded-md w-full"
            >
              <option value="" disabled>Select Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-bold mb-2" htmlFor="appointmentDate">Appointment Date</label>
            <input
              id="appointmentDate"
              type="date"
              value={localData.appointmentDate}
              onChange={(e) => handleChange("appointmentDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={`border p-2 rounded-md w-full ${dateError ? "border-red-500" : ""}`}
            />
            {dateError && <p className="text-red-500">{dateError}</p>}
          </div>

          <div className="mb-4">
            <label className="block font-bold mb-2" htmlFor="appointmentTime">Appointment Time</label>
            <input
              id="appointmentTime"
              type="time"
              value={localData.appointmentTime}
              onChange={(e) => handleChange("appointmentTime", e.target.value)}
              className="border p-2 rounded-md w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold mb-2" htmlFor="reasonForVisit">Reason for Visit</label>
            <input
              id="reasonForVisit"
              value={localData.reasonForVisit}
              onChange={(e) => handleChange("reasonForVisit", e.target.value)}
              className="border p-2 rounded-md w-full"
              placeholder="Enter reason for visit"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="doctorId" className="block font-bold mb-2">Select Doctor</label>
            <select
              id="doctorId"
              name="doctorId"
              value={localData.doctorId.id}
              onChange={(e) => {
                const selectedDoctor = doctors.find(doctor => doctor._id === e.target.value);
                if (selectedDoctor) {
                  handleChange("doctorId", { id: selectedDoctor._id, username: selectedDoctor.username });
                }
              }}
              className="border p-2 rounded-md w-full"
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.username}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-4 text-red-600">Cancel</button>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
