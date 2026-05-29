import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Chip,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Pagination,
} from '@mui/material';

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const STATUS_COLORS = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
};

const PAGE_SIZE = 10;

export default function TaskTable({ tasks, onEdit }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (dateFilter && t.due_date) {
      const taskDate = new Date(t.due_date).toISOString().split('T')[0];
      if (taskDate !== dateFilter) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [statusFilter, dateFilter]);

  const clearFilters = () => {
    setStatusFilter('');
    setDateFilter('');
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <TextField
          type="date"
          size="small"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        {(statusFilter || dateFilter) && (
          <Button variant="outlined" size="small" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}

        <Typography variant="body2" color="text.secondary">
          {filtered.length} of {tasks.length} tasks
        </Typography>
      </Stack>

      {filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No tasks match the current filters.
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  {onEdit && <TableCell>Action</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell>{task.id}</TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.assigned_name || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[task.status]}
                        color={STATUS_COLORS[task.status] || "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    {onEdit && (
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => onEdit(task)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="small"
              />
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}
