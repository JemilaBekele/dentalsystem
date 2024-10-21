"use client";
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation';
type Patient = {
  _id: string;
  firstname: string;
  sex: string;
  age: string;
  cardno:  string;
 };

const Home: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patient/MedicalHistory/doc');
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        console.log("Patients data:", data.data); // Ensure you're accessing the correct data structure
        if (Array.isArray(data.data) && data.data.length > 0) {
          setPatients(data.data); // Adjust according to the response structure
        } else {
          setError('No patients found');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
        console.error('Error fetching patients:', error);
      }
    };

    // Fetch data initially
    fetchPatients();

    // Set interval for refreshing data every 20 seconds
    const intervalId = setInterval(fetchPatients, 20000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="mt-24 ml-0 lg:ml-60 w-full max-w-4xl lg:max-w-[calc(100%-15rem)] mx-auto p-5 rounded-lg">
      <h1 className="text-xl font-bold mb-5">Patients</h1>
      {error && <div className="text-gray-500">{error}</div>}
      <Table>
        <TableCaption>A list of patients with recent medical findings.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Card No</TableHead>
           
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map(({ _id, firstname, age,cardno,sex }) => (
            <TableRow key={_id} onClick={() => router.push(`/doctor/medicaldata/medicalhistory/all/${_id}`)}>
              <TableCell>{firstname}</TableCell>
              <TableCell>{sex}</TableCell>
              <TableCell>{age}</TableCell>
              <TableCell>{cardno}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Home;
