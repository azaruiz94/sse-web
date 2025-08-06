import { Box, Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// project imports
import MainCard from 'components/MainCard';
import RecordsTable from './records-table';

export default function RecordsPage() {
  const tableRef = useRef();
  const navigate = useNavigate();

  return (
    <MainCard title="Expedientes">
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => navigate('/expedientes/create')}
        >
          Nuevo Expediente
        </Button>
      </Box>
      <RecordsTable ref={tableRef} />
    </MainCard>
  );
}