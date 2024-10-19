import { useEffect, useState } from 'react';
import {
  FieldTimeOutlined,
  RiseOutlined,
  FundViewOutlined,
  CalendarOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import RoleCountDisplay from './count';
import TotalCountDisplay from './totalprice';
import TotalCountBalance from './balance';
import TotalMOnthDisplay from './month';

const PatientDashboard = () => {
  const [totalPatients, setTotalPatients] = useState<number | null>(null);
  const [lastMonthPatients, setLastMonthPatients] = useState<number | null>(null);
  const [currentMonthPatients, setCurrentMonthPatients] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTotalPatients = async () => {
    try {
      const response = await fetch('/api/patient/count');
      const data = await response.json();
      if (response.ok) {
        setTotalPatients(data.totalPatients);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch total patients');
    }
  };

  const fetchMonthlyPatients = async () => {
    try {
      const response = await fetch('/api/patient/count/month');
      const data = await response.json();
      if (response.ok) {
        setLastMonthPatients(data.lastMonthPatients);
        setCurrentMonthPatients(data.currentMonthPatients);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch monthly patients');
    }
  };

  useEffect(() => {
    fetchTotalPatients();
    fetchMonthlyPatients();
  }, []);

  return (
    <div className="flex m-7">
      <div className="flex-grow md:ml-60 container mx-auto p-4">
        <div className="min-h-screen flex flex-col sm:flex-row">
          {/* Content Area */}
          <div className="flex-1 p-6 sm:p-10 bg-gray-100">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Dashboard</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {/* Total Patients Box */}
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 flex flex-col items-center text-center">
                <div className="flex flex-col items-center mb-2">
                  <FieldTimeOutlined className="text-3xl sm:text-4xl text-blue-500" />
                  <h2 className="text-lg sm:text-xl font-bold mt-2">Total Patients</h2>
                </div>
                {totalPatients !== null ? (
                  <p className="text-2xl sm:text-3xl font-semibold mt-4">{totalPatients}</p>
                ) : (
                  <p>Loading...</p>
                )}
              </div>

              {/* Monthly Patients Box */}
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 flex flex-col items-center text-center">
                <div className="flex flex-col items-center mb-2">
                  <CalendarOutlined className="text-3xl sm:text-4xl text-red-500" />
                  <h2 className="text-lg sm:text-xl font-bold mt-2">Monthly Patients</h2>
                </div>
                <div className="w-full flex justify-between mt-4">
                  {/* Last Month */}
                  <div className="flex flex-col items-center">
                    <h3 className="text-base sm:text-lg font-semibold">Last Month</h3>
                    {lastMonthPatients !== null ? (
                      <p className="text-lg sm:text-xl">{lastMonthPatients}</p>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                  {/* Current Month */}
                  <div className="flex flex-col items-center">
                    <h3 className="text-base sm:text-lg font-semibold">Current Month</h3>
                    {currentMonthPatients !== null ? (
                      <p className="text-lg sm:text-xl">{currentMonthPatients}</p>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Balance Box */}
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 flex flex-col items-center text-center">
                <AuditOutlined className="text-3xl sm:text-4xl text-green-500 mb-2" />
                <h2 className="text-lg sm:text-xl font-bold mt-2">Total Balance</h2>
                <TotalCountBalance />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-6">
              {/* Employees */}
              <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 flex flex-col items-center text-center">
                <h2 className="text-lg sm:text-xl font-bold mt-4">Employees</h2>
                <RoleCountDisplay />
              </div>

              {/* Invoice */}
              <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 flex flex-col items-center text-center">
                <h2 className="text-lg sm:text-xl font-bold text-green-600 mt-4">
                  <RiseOutlined /> Invoice
                </h2>
                <TotalCountDisplay />
              </div>

              {/* Total Invoice */}
              <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 flex flex-col items-center text-center">
                <h2 className="text-lg sm:text-xl font-bold text-green-600 mt-4">
                  <FundViewOutlined /> Total
                </h2>
                <TotalMOnthDisplay />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
