// material-ui
import { PlusOutlined } from '@ant-design/icons';
import { Box, Button, TextField } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import CreateStateModal from './create-state-modal';
import { useState, useRef } from 'react';
import StatesTable from './states-table';

export default function StatesPage() {
  const tableRef = useRef();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  return (
    <MainCard title="Estados de expedientes"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        >
          Nuevo Estado
        </Button>
      }
    >
      <StatesTable ref={tableRef} />
      <CreateStateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => tableRef.current.refresh()}
      />
    </MainCard>
  );
}