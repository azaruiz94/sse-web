import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchResolutionById } from 'store/slices/resolutionsSlice';
import MainCard from 'components/MainCard';
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material';

export default function ShowResolutionPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { current: resolution, loading, error } = useSelector((state) => state.resolutions);

  useEffect(() => {
    if (id) {
      dispatch(fetchResolutionById(id));
    }
  }, [dispatch, id]);

  return (
    <MainCard title="Resolution Details">
      <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
        <Button variant="outlined" onClick={() => navigate('/resoluciones')} sx={{ mb: 2 }}>
          Back to Resolutions
        </Button>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : resolution ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resolution #{resolution.number}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Issued Date:</strong>{' '}
              {resolution.issuedDate ? new Date(resolution.issuedDate).toLocaleString() : ''}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>File Path:</strong> {resolution.filePath}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Resolved by Dean:</strong> {resolution.resolvedByDean ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Record ID:</strong> {resolution.recordId ?? 'N/A'}
            </Typography>
            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>
                Content
              </Typography>
              <div
                style={{ border: '1px solid #eee', borderRadius: 4, padding: 12, background: '#fafafa' }}
                dangerouslySetInnerHTML={{ __html: resolution.content }}
              />
            </Box>
          </Box>
        ) : (
          <Typography>No resolution found.</Typography>
        )}
      </Paper>
    </MainCard>
    );
}