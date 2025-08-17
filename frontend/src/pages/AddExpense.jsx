import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { formatDateForInput } from "../utils/dateUtils";
import { useEffect } from "react";
import axios from "axios";

const AddExpense = () => {
  const navigate = useNavigate();

  const [categories, setcategories] = useState([]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        setcategories(response.data.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    getCategories();
  }, []);

  const onAddExpense = async (expense) => {
    try {
      const response = await axios.post("/api/expenses", expense);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to add expense",
      };
    }
  };

  // Form state
  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: formatDateForInput(new Date()),
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Alert state
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Common categories for quick selection
  const quickCategories = [
    { name: "Food", icon: "🍔" },
    { name: "Transport", icon: "🚗" },
    { name: "Shopping", icon: "🛍️" },
    { name: "Bills", icon: "📝" },
    { name: "Entertainment", icon: "🎬" },
  ];

  // Common amounts for quick selection
  const quickAmounts = [5, 10, 20, 50, 100];

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // For amount, ensure it's a number
    if (name === "amount") {
      const numValue = parseFloat(value);
      setForm({
        ...form,
        [name]: value === "" ? "" : isNaN(numValue) ? form.amount : numValue,
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Handle quick category selection
  const handleQuickCategory = (category) => {
    setForm({
      ...form,
      category,
    });

    if (errors.category) {
      setErrors({
        ...errors,
        category: null,
      });
    }
  };

  // Handle quick amount selection
  const handleQuickAmount = (amount) => {
    setForm({
      ...form,
      amount,
    });

    if (errors.amount) {
      setErrors({
        ...errors,
        amount: null,
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!form.amount) {
      newErrors.amount = "Amount is required";
    } else if (form.amount <= 0) {
      newErrors.amount = "Amount must be greater than zero";
    }

    if (!form.category) {
      newErrors.category = "Category is required";
    }

    if (!form.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const result = await onAddExpense(form);

        if (result.success) {
          setAlert({
            open: true,
            message: "Expense added successfully!",
            severity: "success",
          });

          // Clear form
          setForm({
            amount: "",
            category: "",
            description: "",
            date: formatDateForInput(new Date()),
          });

          // Redirect after short delay
          setTimeout(() => {
            navigate("/expenses");
          }, 1500);
        } else {
          setAlert({
            open: true,
            message: result.error || "Failed to add expense",
            severity: "error",
          });
        }
      } catch (error) {
        setAlert({
          open: true,
          message: "An unexpected error occurred",
          severity: "error",
        });
      }
    }
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlert({
      ...alert,
      open: false,
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Expense
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {/* Amount field with quick selections */}
          <Typography variant="subtitle1" gutterBottom>
            Amount
          </Typography>
          <TextField
            fullWidth
            name="amount"
            label="Amount"
            type="number"
            variant="outlined"
            value={form.amount}
            onChange={handleChange}
            error={!!errors.amount}
            helperText={errors.amount}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
            inputProps={{ step: 0.01 }}
            sx={{ mb: 1 }}
          />

          <Box sx={{ mb: 3, mt: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Quick amounts:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {quickAmounts.map((amount) => (
                <Chip
                  key={amount}
                  label={`$${amount}`}
                  onClick={() => handleQuickAmount(amount)}
                  variant={form.amount === amount ? "filled" : "outlined"}
                  color={form.amount === amount ? "primary" : "default"}
                  clickable
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Category selection with quick categories */}
          <Typography variant="subtitle1" gutterBottom>
            Category
          </Typography>
          <TextField
            fullWidth
            select
            name="category"
            label="Category"
            variant="outlined"
            value={form.category}
            onChange={handleChange}
            error={!!errors.category}
            helperText={errors.category}
            sx={{ mb: 1 }}
          >
            {categories.map((category) => (
              <MenuItem key={category._id} value={category.name}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ mb: 3, mt: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Quick categories:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {quickCategories.map((cat) => (
                <Chip
                  key={cat.name}
                  label={`${cat.icon} ${cat.name}`}
                  onClick={() => handleQuickCategory(cat.name)}
                  variant={form.category === cat.name ? "filled" : "outlined"}
                  color={form.category === cat.name ? "primary" : "default"}
                  clickable
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Date and description */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Date
              </Typography>
              <TextField
                fullWidth
                name="date"
                label="Date"
                type="date"
                variant="outlined"
                value={form.date}
                onChange={handleChange}
                error={!!errors.date}
                helperText={errors.date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Description (Optional)
              </Typography>
              <TextField
                fullWidth
                name="description"
                label="Description"
                variant="outlined"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g., Lunch with friends"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
            <Button component={Link} to="/expenses" variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              disabled={!form.amount || !form.category || !form.date}
            >
              Add Expense
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Success/Error alert */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alert.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddExpense;
