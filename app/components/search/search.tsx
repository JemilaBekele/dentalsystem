import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from 'next-auth/react';
import { useSearchParams } from "next/navigation";

type User = {
  _id: string;
  cardno: string;
  firstname: string;
  age: string;
  sex: string;
  phoneNumber: string;
};

const UsersPage: React.FC = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const role = useMemo(() => session?.user?.role || '', [session]);

  const roleToRouteMap: { [key: string]: string } = {
    admin: '/admin/medicaldata/medicalhistory/all/{patientId}',
    doctor: '/doctor/medicaldata/medicalhistory/all/{patientId}',
    reception: '/reception/card/all/{patientId}',
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!search) {
        setError("Please provide a Card ID or First Name in the search.");
        setUsers([]); // Reset users when search is invalid
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const isPhoneNumber = /^\d+$/.test(search);
        const endpoint = isPhoneNumber
          ? `/api/patient/registerdata/search?phoneNumber=${search}`
          : `/api/patient/registerdata/search?cardno=${search}`;

        const response = await axios.get<User[]>(endpoint);
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          setError('Unexpected data format received from server');
          setUsers([]); // Reset users if the format is unexpected
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError('No patients found');
        setUsers([]); // Reset users on error
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [search]); // Ensure this dependency is correctly detecting changes

  return (
    <div className="flex m-7">
      <div className="flex-grow md:ml-60 container mx-auto p-4">
      <h1 className="text-3xl font-extrabold text-center mt-10 text-gray-800 mb-6">Patient</h1>
        {error && <div className="error mt-16">{error}</div>}
        {loading && <div className="loading mt-16">Loading...</div>}
        {users.length > 0 && !loading && (
          <Table>
            <TableCaption>A list of Patients.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Card No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Phone Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user._id} onClick={() => router.push(roleToRouteMap[role].replace('{patientId}', user._id))}>
                  <TableCell>{user.cardno}</TableCell>
                  <TableCell>{user.firstname}</TableCell>
                  <TableCell>{user.age}</TableCell>
                  <TableCell>{user.sex}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
