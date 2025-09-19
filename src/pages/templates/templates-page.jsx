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
  const navigate = useNavigate();

  return (
    <MainCard 
      title="Plantillas de Resolución"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => navigate('/templates/create')}
        >
          Nueva Plantilla
        </Button>
      }
    >
      <TemplatesTable ref={tableRef} />
    </MainCard>
  );
}