import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchResolutionById, uploadResolutionPdf, fetchResolutionFileUrl, generateResolution } from 'store/slices/resolutionsSlice';
import { withBase } from 'utils/baseUrl';
import { fixUtf8Mojibake } from 'utils/encodingFix';
import { Box, Typography, Button, CircularProgress, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import UploadResolutionFile from './upload-resolution-modal';
import { useSnackbar } from 'notistack';

export default function ShowResolutionPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);

  const { current: resolution, loading, error } = useSelector((state) => state.resolutions);
  const fileUrl = useSelector(state => state.resolutions.fileUrl);

  useEffect(() => {
    if (id) {
      dispatch(fetchResolutionById(id));
    }
  }, [dispatch, id]);

  const canGenerate = useSelector(state => state.auth.user?.permissions?.includes('GENERAR_RESOLUCION'));

  const handleViewPdf = async () => {
    setFileLoading(true);
    await dispatch(fetchResolutionFileUrl(resolution.id));
    setFileLoading(false);
  };

  const handlePreview = () => {
    if (!resolution) return;
    const url = withBase(`/print/resoluciones/${resolution.id}`);
    window.open(url, '_blank', 'noopener');
  };

  return (
    <Box maxWidth={1200} mt={4}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/resoluciones')}
            sx={{ mb: 2 }}
          >
            Resoluciones
          </Button>
          <Box display="flex" justifyContent="flex-end" mb={2} gap={2}>
            {/* Upload PDF button and handler - only for generated resolutions */}
            {resolution && resolution.generated && (
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
                Editar
              </Button>
            )}
              {resolution && !resolution.resolved && !resolution.generated && canGenerate && (
                <Button variant="outlined" color="primary" onClick={() => setGenerateConfirmOpen(true)} disabled={generateLoading}>
                  {generateLoading ? 'Generando...' : 'Generar resolución'}
                </Button>
              )}
                {resolution && resolution.generated && (
                  <>
                    <Button variant="outlined" onClick={handlePreview}>
                      Imprimir
                    </Button>
                  </>
                )}
          </Box>
        </Box>
        {/* Tag/Chip for draft or resolved */}
        {resolution && (
          <Box display="flex" flexDirection="row" justifyContent="flex-end" alignItems="center" mb={2}>
            <Tooltip title={
              resolution.generated
                ? 'Generada: número y fecha asignados por el servidor.'
                : resolution.resolved
                ? 'Resuelto: la resolución fue emitida.'
                : 'Borrador: todavía no generada.'
            }>
              <span>
                <Chip
                  label={resolution.generated ? 'Generada' : resolution.resolved ? 'Resuelto' : 'Borrador'}
                  size="small"
                  sx={{
                    bgcolor: (theme) =>
                      resolution.generated
                        ? theme.palette.success.lighter
                        : resolution.resolved
                        ? theme.palette.success.lighter
                        : theme.palette.warning.lighter,
                    color: (theme) =>
                      resolution.generated
                        ? theme.palette.success.dark
                        : resolution.resolved
                        ? theme.palette.success.dark
                        : theme.palette.warning.dark,
                    fontSize: 14,
                  }}
                />
              </span>
            </Tooltip>
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
                  Resolución #{resolution.number}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Fecha:</strong>{' '}
                  {(() => {
                    try {
                      if (!resolution.issuedDate) return '';
                      const d = new Date(resolution.issuedDate);
                      if (isNaN(d.getTime())) return '';
                      return d.toLocaleString();
                    } catch (e) {
                      return '';
                    }
                  })()}
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
                    Contenido
                  </Typography>
                  <div
                    style={{ border: '1px solid #eee', borderRadius: 4, padding: 12, background: '#fafafa' }}
                    dangerouslySetInnerHTML={{ __html: fixUtf8Mojibake(resolution.content) }}
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
                {/* Generate confirmation dialog */}
                <Dialog open={generateConfirmOpen} onClose={() => setGenerateConfirmOpen(false)}>
                  <DialogTitle>Generar resolución</DialogTitle>
                  <DialogContent dividers>
                    <Typography>
                      Se generará la resolución y se asignará número y fecha de emisión automáticamente. ¿Deseas continuar?
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setGenerateConfirmOpen(false)} disabled={generateLoading}>Cancelar</Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={async () => {
                        try {
                          setGenerateLoading(true);
                          const resp = await dispatch(generateResolution(resolution.id)).unwrap();
                          // refresh current resolution from returned DTO
                          // reducers already update state.current on fulfilled
                        } catch (err) {
                          enqueueSnackbar(err || 'Error al generar resolución', { variant: 'error' });
                        } finally {
                          setGenerateLoading(false);
                          setGenerateConfirmOpen(false);
                        }
                      }}
                      disabled={generateLoading}
                    >
                      {generateLoading ? 'Generando...' : 'Generar'}
                    </Button>
                  </DialogActions>
                </Dialog>
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