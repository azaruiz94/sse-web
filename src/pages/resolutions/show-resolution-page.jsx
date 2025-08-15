import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchResolutionById, uploadResolutionPdf, fetchResolutionFileUrl } from 'store/slices/resolutionsSlice';
import { Box, Typography, Button, CircularProgress, Paper, Chip } from '@mui/material';
import { CheckOutlined, EditOutlined } from '@ant-design/icons';
import UploadResolutionFile from './upload-resolution-modal';
import { useSnackbar } from 'notistack';

export default function ShowResolutionPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const { current: resolution, loading, error } = useSelector((state) => state.resolutions);
  const fileUrl = useSelector(state => state.resolutions.fileUrl);

  useEffect(() => {
    if (id) {
      dispatch(fetchResolutionById(id));
    }
  }, [dispatch, id]);

  const handleViewPdf = async () => {
    setFileLoading(true);
    await dispatch(fetchResolutionFileUrl(resolution.id));
    setFileLoading(false);
  };

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
          <Box display="flex" justifyContent="flex-end" mb={2} gap={2}>
            {/* Upload PDF button and handler */}
            {resolution && !resolution.resolved && (
              <Button variant="contained" color="secondary" onClick={() => setUploadOpen(true)}>
                Subir PDF
              </Button>
            )}
            {resolution && !resolution.resolved && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/resoluciones/${resolution.id}/edit`)}
              >
                Editar resolución
              </Button>
            )}
          </Box>
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
        ) : (
          <Box>
            
            {resolution ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Resolution #{resolution.number}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Issued Date:</strong>{' '}
                  {resolution.issuedDate ? new Date(resolution.issuedDate).toLocaleString() : ''}
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
                {error && (
                  <Typography color="error" mb={2}>
                    {typeof error === 'object'
                      ? error.detail || error.description || error.message || JSON.stringify(error)
                      : error}
                  </Typography>
                )}
                
                {/* PDF Viewing and Upload Section */}
                {resolution.filePath && (
                  <Box mt={2} mb={2}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleViewPdf}
                      disabled={fileLoading}
                    >
                      {fileLoading ? 'Generando enlace...' : 'Ver PDF'}
                    </Button>
                    {fileUrl && (
                      <>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: 16, textDecoration: 'none' }}
                        >
                          <Button variant="contained" color="success">
                            Abrir PDF
                          </Button>
                        </a>
                        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                          Por seguridad, el enlace será válido sólo por 5 minutos.
                        </Typography>
                      </>
                    )}
                  </Box>
                )}

                <UploadResolutionFile
                  open={uploadOpen}
                  onClose={() => setUploadOpen(false)}
                  onUpload={async (file) => {
                    if (file.size > 5 * 1024 * 1024) { // 5MB limit
                      enqueueSnackbar('El archivo excede el tamaño máximo permitido (5MB)', { variant: 'error' });
                      setUploadOpen(false);
                      return;
                    }
                    const action = await dispatch(uploadResolutionPdf({ id: resolution.id, file }));
                    setUploadOpen(false); // Always close modal after attempt
                    if (uploadResolutionPdf.fulfilled.match(action)) {
                      await dispatch(fetchResolutionById(resolution.id));
                    } else {
                      enqueueSnackbar(
                        typeof action.payload === 'object'
                          ? action.payload.detail || action.payload.description || action.payload.message || 'Error al subir el archivo'
                          : action.payload || 'Error al subir el archivo',
                        { variant: 'error' }
                      );
                    }
                  }}
                />
              </>
            ) : (
              <Typography>No resolution found.</Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
    );
}