import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTemplateById } from 'store/slices/templatesSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, CircularProgress, Stack } from '@mui/material';

export default function ShowTemplatePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: template, loading } = useSelector(state => state.templates);

  useEffect(() => {
    if (id) {
      dispatch(fetchTemplateById(id));
    }
  }, [dispatch, id]);

  if (loading || !template) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={800} mx="auto" mt={4} sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">
            {template.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/templates/${template.id}/edit`)}
          >
            Editar
          </Button>
        </Stack>
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>Contenido</Typography>
          <Box
            sx={{
              border: '1px solid #bdbdbd',
              borderRadius: 1,
              p: 2,
              background: '#fff'
            }}
            dangerouslySetInnerHTML={{ __html: template.content }}
          />
        </Box>
      </Paper>
    </Box>
  );
}