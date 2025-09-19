import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const DeleteApplicantModal = ({ open, onClose, applicant, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent dividers>
        {applicant ? (
          <Typography>
            ¿Seguro que desea eliminar a{' '}<strong>{applicant.names}</strong>{' '} del sistema?
          </Typography>
        ) : (
          <Typography>Cargando...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteApplicantModal;