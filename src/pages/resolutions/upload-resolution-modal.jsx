import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export default function UploadResolutionFile({ open, onClose, onUpload }) {
  const [file, setFile] = useState(null);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Subir PDF de Resolución</DialogTitle>
      <DialogContent>
        <Button variant="outlined" component="label" fullWidth>
          Seleccionar PDF
          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={e => setFile(e.target.files[0])}
          />
        </Button>
        {file && (
          <Typography variant="body2" mt={2}>
            Archivo seleccionado: {file.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={() => onUpload(file)}
          disabled={!file}
          variant="contained"
          color="primary"
        >
          Subir
        </Button>
      </DialogActions>
    </Dialog>
  );
}