import { Box, Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// project imports
import MainCard from 'components/MainCard';
import RecordsTable from './records-table';

export default function RecordsPage() {
  const tableRef = useRef();
  const loading = useSelector(state => state.records.loading);
  const navigate = useNavigate();

  return (
    <MainCard title="Expedientes" loading={loading}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => navigate('/records/create')}
        >
          Nuevo Expediente
        </Button>
      </Box>
      <RecordsTable ref={tableRef} />
    </MainCard>
  );
}