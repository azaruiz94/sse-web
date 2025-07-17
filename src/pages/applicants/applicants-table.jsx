import {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchApplicants,
  fetchApplicantById,
  deleteApplicant,
  searchApplicants
} from '../../store/slices/applicantsSlice';
import { DataGrid } from '@mui/x-data-grid';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import IconButton from '@mui/material/IconButton';
import ShowApplicantModal from './show-applicant-modal';
import EditApplicantModal from './edit-applicant-modal';
import DeleteApplicantModal from './delete-applicant-modal';
import { useSnackbar } from 'notistack';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box
} from '@mui/material';

const ApplicantsTable = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const applicants = useSelector((state) => state.applicants.list);
  const total = useSelector((state) => state.applicants.total);
  const page = useSelector((state) => state.applicants.page);
  const loading = useSelector((state) => state.applicants.loading);
  const selectedApplicant = useSelector((state) => state.applicants.selectedApplicant);

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [applicantToDelete, setApplicantToDelete] = useState(null);

  const handleShow = useCallback(async (id) => {
    await dispatch(fetchApplicantById(id));
    setModalOpen(true);
  }, [dispatch]);

  const handleEdit = (row) => {
    setEditingApplicant(row);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (row) => {
    setApplicantToDelete(row);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteApplicant(applicantToDelete.id)).unwrap();
      enqueueSnackbar('Applicant deleted successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err || 'Failed to delete applicant', { variant: 'error' });
    } finally {
      setDeleteModalOpen(false);
      setApplicantToDelete(null);
    }
  };

  const columns = [
    { field: 'names', headerName: 'Name', width: 200 },
    { field: 'mail', headerName: 'Email', width: 250 },
    { field: 'address', headerName: 'Address', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleShow(params.row.id)}>
            <EyeOutlined />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleEdit(params.row)}>
            <EditOutlined />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteClick(params.row)}>
            <DeleteOutlined />
          </IconButton>
        </>
      )
    }
  ];

  useImperativeHandle(ref, () => ({
    refresh: () => {
      dispatch(fetchApplicants(page));
    },
    searchApplicants: (term) => {
      if (term.trim()) {
        dispatch(searchApplicants({ term, page: 0 }));
      } else {
        dispatch(fetchApplicants(0)); // fallback to full list
      }
    }
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Applicants
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <div style={{ height: 420, width: '100%' }}>
            <DataGrid
              rows={applicants}
              columns={columns}
              paginationMode="server"
              rowCount={total}
              loading={loading}
              pageSizeOptions={[5]}
              paginationModel={{ page, pageSize: 5 }}
              onPaginationModelChange={({ page: newPage }) => {
                dispatch(fetchApplicants(newPage));
              }}
              disableSelectionOnClick
            />
          </div>
        )}

        <ShowApplicantModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          applicant={selectedApplicant}
        />
        <EditApplicantModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          applicant={editingApplicant}
        />
        <DeleteApplicantModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          applicant={applicantToDelete}
          onConfirm={handleConfirmDelete}
        />
      </CardContent>
    </Card>
  );
});

export default ApplicantsTable;
