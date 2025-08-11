import { Box, Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// project imports
import MainCard from 'components/MainCard';
import ResolutionsTable from './resolutions-table';

export default function ResolutionsPage() {
  const tableRef = useRef();
  const navigate = useNavigate();

  return (
    <MainCard
      title="Resoluciones"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => navigate('/resoluciones/create')}
        >
          Nueva Resolución
        </Button>
      }
    >
      <ResolutionsTable ref={tableRef} />
    </MainCard>
  );
}