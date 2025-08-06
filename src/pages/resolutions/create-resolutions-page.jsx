import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, TextField, FormControlLabel, Checkbox, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createResolution } from 'store/slices/resolutionsSlice';
import MainCard from 'components/MainCard';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function CreateResolutionPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    issuedDate: new Date().toISOString().slice(0, 16),
    number: '',
    filePath: '',
    resolvedByDean: false,
    content: '',
    recordId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (event, editor) => {
    setForm((prev) => ({
      ...prev,
      content: editor.getData()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await dispatch(
        createResolution({
          issuedDate: new Date(form.issuedDate).toISOString(),
          number: Number(form.number),
          filePath: form.filePath,
          resolvedByDean: form.resolvedByDean,
          content: form.content,
          recordId: form.recordId === '' ? null : Number(form.recordId)
        })
      ).unwrap();
      // Redirect to show page for the created resolution
      navigate(`/resoluciones/${result.id}`);
    } catch (err) {
      setError(err?.message || 'Error creating resolution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Create Resolution">
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Number"
            name="number"
            type="number"
            value={form.number}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Issued Date"
            name="issuedDate"
            type="datetime-local"
            value={form.issuedDate}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="File Path"
            name="filePath"
            value={form.filePath}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.resolvedByDean}
                onChange={handleChange}
                name="resolvedByDean"
              />
            }
            label="Resolved by Dean"
          />
          <TextField
            label="Record ID"
            name="recordId"
            type="number"
            value={form.recordId}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputProps={{ inputProps: { min: 0 } }}
            placeholder="Leave empty for none"
          />
          <Box mt={2} mb={1}>
            <Typography variant="subtitle1" gutterBottom>
              Content
            </Typography>
            <CKEditor
              editor={ClassicEditor}
              data={form.content}
              onChange={handleContentChange}
            />
          </Box>
          {error && (
            <Typography color="error" variant="body2" mb={2}>
              {error}
            </Typography>
          )}
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Create'}
            </Button>
          </Box>
        </form>
      </Paper>
    </MainCard>
  );
}