import { useRef, useState, useMemo, useEffect } from 'react';
import { CircularProgress, InputAdornment, Box, Button, TextField, Stack } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import ApplicantsTable from './applicants-table';
import CreateApplicantModal from './create-applicant-modal';
import debounce from 'lodash/debounce';
import { useSelector } from 'react-redux';

export default function ApplicantsPage() {
  const tableRef = useRef();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const loading = useSelector(state => state.applicants.loading);

  // Debounced search function
  const debouncedSearch = useMemo(() => debounce((term) => {
    if (term.trim()) {
      tableRef.current.searchApplicants(term);
    } else {
      tableRef.current.refresh();
    }
  }, 500), []);

  useEffect(() => {
  if (searchTerm.trim()) {
    debouncedSearch(searchTerm);
    } else {
      tableRef.current.refresh(); // only fetch all when searchTerm is empty
    }
  return () => debouncedSearch.cancel();
  }, [searchTerm]);

  return (
    <MainCard 
      title="Solicitantes"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        >
          Nuevo Solicitante
        </Button>
      }
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" spacing={1}>
          <TextField
            placeholder="Nombre o número de documento"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {loading && <CircularProgress size={16} />}
                </InputAdornment>
              )
            }}
          />
        </Stack>
      </Box>
      <ApplicantsTable ref={tableRef} />
      <CreateApplicantModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => tableRef.current.refresh()}
      />
    </MainCard>
  );
}
