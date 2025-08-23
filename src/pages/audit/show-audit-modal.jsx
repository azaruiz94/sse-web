import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

export default function ShowAuditModal({ open, onClose, audit }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalle de Auditoría</DialogTitle>
      <DialogContent>
        {audit ? (
          <>
            <Typography variant="body2"><strong>Entidad:</strong> {audit.entityName}</Typography>
            <Typography variant="body2"><strong>Acción:</strong> {audit.action}</Typography>
            <Typography variant="body2"><strong>Usuario:</strong> {audit.changedBy}</Typography>
            <Typography variant="body2"><strong>Fecha:</strong> {audit.changedAt ? new Date(audit.changedAt * 1000).toLocaleString() : ''}</Typography>
            <Box mt={2}>
              <Typography variant="subtitle2">Valor anterior:</Typography>
              <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                {audit.oldValue ? JSON.stringify(JSON.parse(audit.oldValue), null, 2) : 'N/A'}
              </pre>
            </Box>
            <Box mt={2}>
              <Typography variant="subtitle2">Valor nuevo:</Typography>
              <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                {audit.newValue ? JSON.stringify(JSON.parse(audit.newValue), null, 2) : 'N/A'}
              </pre>
            </Box>
          </>
        ) : (
          <Typography>No hay datos de auditoría.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}