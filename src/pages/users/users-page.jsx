// material-ui
import { CircularProgress, InputAdornment, Box, Button, TextField, Stack, IconButton } from '@mui/material';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

// project imports
import MainCard from 'components/MainCard';
import UsersTable from './users-table';
import CreateUserModal from './create-user-modal';

export default function UsersPage() {
  const tableRef = useRef();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const loading = useSelector(state => state.users.loading);


  const handleSearchInputEnter = (e) => {
    if (e.key === 'Enter') {
      if (searchTerm.trim()) {
        tableRef.current.searchUsers(searchTerm);
      }
      else {
        tableRef.current.refresh();
      }
    }
  };

  return (
    <MainCard 
      title="Usuarios del sistema"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        >
          Nuevo Usuario
        </Button>
      }
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" spacing={1}>
          <TextField
            placeholder="Buscar por correo o numero de documento"
            size="small"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.trim() === '') {
                tableRef.current.refresh();
              }
            }}
            onKeyDown={handleSearchInputEnter}
            sx={{ width: 300 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {searchTerm && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchTerm('');
                        tableRef.current.refresh();
                      }}
                      aria-label="clear"
                    >
                      <CloseOutlined />
                    </IconButton>
                  )}
                  {loading && <CircularProgress size={16} />}
                </InputAdornment>
              )
            }}
          />
        </Stack>
      </Box>
      <UsersTable ref={tableRef} />
      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => tableRef.current.refresh()}
      />
    </MainCard>
  );
}