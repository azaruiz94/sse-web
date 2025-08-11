// material-ui
import { PlusOutlined } from '@ant-design/icons';
import { Box, Button, Typography } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import CreateRoleModal from './create-role-modal';
import { useState, useRef } from 'react';
import RolesTable from './roles-table';

export default function RolesPage() {
  const tableRef = useRef();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  return (
    <MainCard 
      title="Roles de usuarios del sistema"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        >
          Nuevo Rol
        </Button>
      }
    >
      <RolesTable ref={tableRef} />
      <CreateRoleModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => tableRef.current.refresh()}
      />
    </MainCard>
  );
}