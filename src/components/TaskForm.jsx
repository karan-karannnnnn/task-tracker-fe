import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';

export default function TaskForm({ employees, initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    status: 'pending',
    due_date: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        assigned_to: initialData.assigned_to || '',
        status: initialData.status || 'pending',
        due_date: initialData.due_date
          ? new Date(initialData.due_date).toISOString().split('T')[0]
          : '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, assigned_to: Number(form.assigned_to) });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Task title"
          required
          size="small"
          fullWidth
        />

        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional description"
          multiline
          rows={3}
          size="small"
          fullWidth
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl size="small" fullWidth required>
            <InputLabel>Assign To</InputLabel>
            <Select
              name="assigned_to"
              value={form.assigned_to}
              label="Assign To"
              onChange={handleChange}
            >
              <MenuItem value="">Select employee</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={form.status}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleChange}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
