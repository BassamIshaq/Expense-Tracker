import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  TablePagination,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { formatDate } from "../utils/dateUtils";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import axios from "axios";

const ExpenseList = ({ onDelete, onUpdate, isLoading }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    const getExpenses = async () => {
      try {
        const response = await axios.get("/api/expenses");
        setExpenses(response.data.data);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      }
    };
    getCategories();
    getExpenses();
  }, []);

  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Apply filters when expenses or filter settings change
  useEffect(() => {
    let result = [...expenses];

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((expense) => expense.category === categoryFilter);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (expense) =>
          expense.description?.toLowerCase().includes(term) ||
          expense.category.toLowerCase().includes(term)
      );
    }

    // Apply date range
    if (startDate) {
      const start = new Date(startDate);
      result = result.filter((expense) => new Date(expense.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      result = result.filter((expense) => new Date(expense.date) <= end);
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredExpenses(result);
  }, [expenses, categoryFilter, searchTerm, startDate, endDate]);

  // Handle edit button click
  const handleEditClick = (expense) => {
    setSelectedExpense(expense);
    setEditForm({
      amount: expense.amount,
      category: expense.category,
      description: expense.description || "",
      date: new Date(expense.date).toISOString().split("T")[0],
    });
    setEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  // Handle form input change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    });
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (selectedExpense && editForm.amount > 0 && editForm.category) {
      await onUpdate(selectedExpense._id, editForm);
      setEditDialogOpen(false);
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (selectedExpense) {
      await onDelete(selectedExpense._id);
      setDeleteDialogOpen(false);
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated data
  const paginatedExpenses = filteredExpenses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Export functions
  const handleExportCSV = () => {
    exportToCSV(filteredExpenses);
  };

  const handleExportPDF = () => {
    exportToPDF(filteredExpenses, "Expense List");
  };

  return (
    <div>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Expense List
          </Typography>
          <Box>
            <Button onClick={handleExportCSV} sx={{ mr: 1 }}>
              Export CSV
            </Button>
            <Button variant="contained" onClick={handleExportPDF}>
              Export PDF
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, minWidth: "200px" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              size="small"
              sx={{ minWidth: "150px" }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="From Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />

            <TextField
              label="To Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />

            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => {
                setCategoryFilter("all");
                setSearchTerm("");
                setStartDate("");
                setEndDate("");
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </Paper>

        {/* Expense Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedExpenses.length > 0 ? (
                paginatedExpenses.map((expense) => (
                  <TableRow key={expense._id} hover>
                    <TableCell>
                      {new Date(expense.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={expense.category}
                        size="small"
                        sx={{
                          backgroundColor:
                            categories.find((c) => c.name === expense.category)
                              ?.color || "#757575",
                          color: "#fff",
                        }}
                      />
                    </TableCell>
                    <TableCell>{expense.description || "-"}</TableCell>
                    <TableCell align="right">
                      ${expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(expense)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(expense)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No expenses found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredExpenses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                margin="dense"
                name="amount"
                label="Amount"
                type="number"
                fullWidth
                variant="outlined"
                value={editForm.amount}
                onChange={handleEditFormChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                margin="dense"
                name="category"
                select
                label="Category"
                fullWidth
                variant="outlined"
                value={editForm.category}
                onChange={handleEditFormChange}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                margin="dense"
                name="description"
                label="Description"
                fullWidth
                variant="outlined"
                value={editForm.description}
                onChange={handleEditFormChange}
              />

              <TextField
                margin="dense"
                name="date"
                label="Date"
                type="date"
                fullWidth
                variant="outlined"
                value={editForm.date}
                onChange={handleEditFormChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleEditSubmit}
              variant="contained"
              disabled={
                !editForm.amount || !editForm.category || !editForm.date
              }
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default ExpenseList;
