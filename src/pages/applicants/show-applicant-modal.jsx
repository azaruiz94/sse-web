import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

const ShowApplicantModal = ({ open, onClose, applicant }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalles del Solicitante</DialogTitle>
      <DialogContent dividers>
        {applicant ? (
          <Box>
            <Typography><strong>Nombre:</strong> {applicant.names}</Typography>
            <Typography><strong>Nro. Documento:</strong> {applicant.document}</Typography>
            <Typography><strong>Correo:</strong> {applicant.mail}</Typography>
            <Typography><strong>Dirección:</strong> {applicant.address}</Typography>
            <Typography><strong>Teléfono:</strong> {applicant.phone}</Typography>
          </Box>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowApplicantModal;
