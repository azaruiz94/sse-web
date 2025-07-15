// material-ui
import { PlusOutlined } from '@ant-design/icons';
import { Box, Button, Typography } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import CreateDependencyModal from './create-dependency-modal';
import { useState, useRef } from 'react';
import DependenciesTable from './dependencies-table';

export default function DependenciesPage() {
  const tableRef = useRef();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  return (
    <MainCard title="Dependencias de la FIUNI">
      <Box display="flex" justifyContent="right" alignItems="center" mb={2}>
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        >
          Nueva Dependencia
        </Button>
      </Box>
      <DependenciesTable ref={tableRef} />

      <CreateDependencyModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => tableRef.current.refresh()}
      />
    </MainCard>
  );
}