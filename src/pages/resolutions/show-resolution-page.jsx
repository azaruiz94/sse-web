import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchResolutionById } from 'store/slices/resolutionsSlice';
import MainCard from 'components/MainCard';
import { Box, Typography, Button, CircularProgress, Paper, Chip } from '@mui/material';
import { CheckOutlined, EditOutlined } from '@ant-design/icons';

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
    <Box maxWidth={1200} mx="auto" mt={4}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/resoluciones')}
            sx={{ mb: 2 }}
          >
            Back to Resolutions
          </Button>
          {resolution && !resolution.resolved && (
            <Button
              variant="contained"
              color="primary"
              sx={{ mb: 2 }}
              onClick={() => navigate(`/resoluciones/${resolution.id}/edit`)}
            >
              Editar resolución
            </Button>
          )}
        </Box>
        {/* Tag/Chip for draft or resolved */}
        {resolution && (
          <Box display="flex" flexDirection="row" justifyContent="flex-end" alignItems="center" mb={2}>
            <Chip
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  {resolution.resolved ? (
                    <CheckOutlined style={{ fontSize: 16, marginRight: 4 }} />
                  ) : (
                    <EditOutlined style={{ fontSize: 16, marginRight: 4 }} />
                  )}
                  {resolution.resolved ? "Resuelto" : "Borrador"}
                </Box>
              }
              size="small"
              sx={{
                bgcolor: (theme) =>
                  resolution.resolved
                    ? theme.palette.success.lighter
                    : theme.palette.warning.lighter,
                color: (theme) =>
                  resolution.resolved
                    ? theme.palette.success.dark
                    : theme.palette.warning.dark,
                fontSize: 14,
              }}
            />
          </Box>
        )}
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
              <strong>File Path:</strong> {resolution.filePath ?? 'N/A'}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Resuelto por:</strong>{" "}
              {resolution.resolvedByDean ? "Decano" : "Consejo Directivo"}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Expediente:</strong>{" "}
              {resolution.recordSummary
                ? `#${resolution.recordSummary.number} - ${resolution.recordSummary.applicantNames || ''} (Documento: ${resolution.recordSummary.applicantDocument || ''})`
                : 'N/A'}
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
    </Box>
    );
}