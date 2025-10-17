import { Outlet } from 'react-router-dom';

// ==============================|| PRINT LAYOUT ||============================== //

const PrintLayout = () => {
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'white',
      fontFamily: '"Times New Roman", serif'
    }}>
      <Outlet />
    </div>
  );
};

export default PrintLayout;
