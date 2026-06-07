import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TableSessionSetter = () => {
  const { tableNum } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (tableNum) {
      sessionStorage.setItem('table_number', tableNum);
      console.log(`QR Table ${tableNum} registered in session storage.`);
    }
    // Redirect to menu page passing state
    navigate('/menu', { state: { tableDetected: tableNum } });
  }, [tableNum, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-ivory">
      <div className="text-center space-y-4">
        <div className="h-10 w-10 border-4 border-caramel border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-body text-espresso font-medium text-sm">Registering Table {tableNum}...</p>
      </div>
    </div>
  );
};

export default TableSessionSetter;
