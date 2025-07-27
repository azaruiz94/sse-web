import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";

export default function ForwardRecordModal({
  open,
  onClose,
  onSubmit,
  record,
  dependencies,
  states,
  loading
}) {
  // Initial values from the current record
  const [dependencyId, setDependencyId] = useState(record?.dependencyId || "");
  const [stateId, setStateId] = useState(record?.stateId || "");
  const [comment, setComment] = useState("");

  // Reset fields when record changes or modal opens
  React.useEffect(() => {
    setDependencyId(record?.dependencyId || "");
    setStateId(record?.stateId || "");
    setComment("");
  }, [record, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: record.id,
      dependencyId,
      stateId,
      comment
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Reenviar expediente</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="dependency-label">Nueva dependencia</InputLabel>
            <Select
              labelId="dependency-label"
              value={dependencyId}
              label="Nueva dependencia"
              onChange={e => setDependencyId(e.target.value)}
              required
            >
              {dependencies.map(dep => (
                <MenuItem key={dep.id} value={dep.id}>
                  {dep.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="state-label">Nuevo estado</InputLabel>
            <Select
              labelId="state-label"
              value={stateId}
              label="Nuevo estado"
              onChange={e => setStateId(e.target.value)}
              required
            >
              {states.map(state => (
                <MenuItem key={state.id} value={state.id}>
                  {state.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Comentario"
            value={comment}
            onChange={e => setComment(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Enviando..." : "Reenviar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}