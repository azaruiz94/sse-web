import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <Box
      minHeight="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
    >
      <Paper elevation={3} sx={{ p: 5, maxWidth: 400, textAlign: 'center' }}>
        <Typography variant="h1" color="error" gutterBottom>
          403
        </Typography>
        <Typography variant="h5" gutterBottom>
          Acceso denegado
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          No tienes permiso para acceder a esta página.<br />
          Si crees que esto es un error, contacta al administrador.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
        >
          Ir al inicio
        </Button>
      </Paper>
    </Box>
  );
}