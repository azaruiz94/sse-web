import { useRef, useState } from 'react';
import { Box, Button, TextField, Stack, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// project imports
import MainCard from 'components/MainCard';
import RecordsTable from './records-table';
import { useSelector } from 'react-redux';

export default function RecordsPage() {
  const tableRef = useRef();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const loading = useSelector(state => state.records.loading);

  // Handle search on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (searchTerm.trim()) {
        tableRef.current.searchRecords(searchTerm);
      } else {
        tableRef.current.refresh();
      }
    }
  };

  // Handle clearing the search input
  const handleClearSearch = () => {
    setSearchTerm('');
    tableRef.current.refresh();
  };

  return (
    <MainCard 
      title="Expedientes"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => navigate('/expedientes/create')}
        >
          Nuevo Expediente
        </Button>
      }
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" spacing={1}>
          <TextField
            placeholder="Buscar expedientes"
            size="small"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value === '') {
                tableRef.current.refresh();
              }
            }}
            onKeyDown={handleSearchKeyDown}
            sx={{ width: 300 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {searchTerm && (
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      aria-label="clear search"
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
      <RecordsTable ref={tableRef} />
    </MainCard>
  );
}