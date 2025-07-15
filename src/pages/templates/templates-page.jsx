import { Box, Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// project imports
import MainCard from 'components/MainCard';
import TemplatesTable from './templates-table';

export default function TemplatesPage() {
  const tableRef = useRef();
  const loading = useSelector(state => state.templates.loading);
  const navigate = useNavigate();

  return (
    <MainCard title="Plantillas de Resolución">
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => navigate('/templates/create')}
        >
          Nueva Plantilla
        </Button>
      </Box>
      <TemplatesTable ref={tableRef} />
    </MainCard>
  );
}