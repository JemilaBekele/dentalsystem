import React, { useState, useEffect } from "react"; 


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

interface EditHealthRecordModalProps {
    isOpen: boolean;
    formData: MedicalRecordData | null;  
    onClose: () => void;
    onUpdate: (data: MedicalRecordData) => Promise<void>;  // Allow async function here
}


const EditHealthRecordModal: React.FC<EditHealthRecordModalProps> = ({
    isOpen,
    formData,
    onClose,
    onUpdate,
}) => {
    const [localData, setLocalData] = useState<MedicalRecordData | null>(formData);

    useEffect(() => {
        setLocalData(formData);
    }, [formData]);

    if (!isOpen || !localData) return null;

    const handleChange = (field: keyof MedicalRecordData, value: string) => {
        setLocalData({ ...localData, [field]: value });
    };

   

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (localData) {
            onUpdate(localData); 
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Edit Medical Record</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block font-bold mb-2" htmlFor="bloodgroup">bloodgroup </label>
                <select
                id="bloodgroup"
                name="bloodgroup"
                value={localData.bloodgroup}
                onChange={(e) => handleChange("bloodgroup", e.target.value)}  // Fix is here
                className="border p-2 rounded-md w-full"
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

                    </div>
                    <div className="mb-4">
                        <label className="block font-bold mb-2" htmlFor="weight">weight</label>
                        <input
                            id="weight"
                            
                            value={localData.weight}
                            onChange={(e) => handleChange("weight", e.target.value)}
                            className="border p-2 rounded-md w-full"
                            placeholder="Enter weight"
                            
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block font-bold mb-2" htmlFor="height">height</label>
                        <input
                            id="vital-sign"
                           
                            value={localData.height}
                            onChange={(e) => handleChange("height", e.target.value)}
                            className="border p-2 rounded-md w-full"
                            placeholder="Enter height"
                            
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block font-bold mb-2" htmlFor="past-medical-history">Past Medical History</label>
                        <input
                            id="past-allergies"
                            
                            value={localData.allergies}
                            onChange={(e) => handleChange("allergies", e.target.value)}
                            className="border p-2 rounded-md w-full"
                            placeholder="Enter allergies"
                            
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block font-bold mb-2" htmlFor="past-habits">habits</label>
                        <input
                            id="past-dental-history"
                           
                            value={localData.habits}
                            onChange={(e) => handleChange("habits", e.target.value)}
                            className="border p-2 rounded-md w-full"
                            placeholder="Enter habits"
                            
                        />
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

export default EditHealthRecordModal;
