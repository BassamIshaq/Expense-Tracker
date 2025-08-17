import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useEffect } from "react";
// import { SketchPicker } from "react-color";

const CategoryManagement = () => {
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
    getCategories();
  }, []);

  const onAddCategory = async (category) => {
    await new Promise((resolve) => {
      axios
        .post("/api/categories", category)
        .then((response) => {
          resolve({ success: true, data: response.data });
        })
        .catch((error) => {
          resolve({
            success: false,
            error: error.response?.data?.error || "Failed to add category",
          });
        });
    });
  };

  // New category form
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#1976d2",
  });

  // Color picker dialog
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // Alerts
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Handle form input change
  const handleNewCategoryChange = (e) => {
    setNewCategory({
      ...newCategory,
      [e.target.name]: e.target.value,
    });
  };

  // Handle color change
  const handleColorChange = (color) => {
    setNewCategory({
      ...newCategory,
      color: color.hex,
    });
  };

  // Handle add category
  const handleAddCategory = async () => {
    if (newCategory.name.trim()) {
      try {
        const result = await onAddCategory(newCategory);

        if (result.success) {
          setAlert({
            open: true,
            message: "Category added successfully!",
            severity: "success",
          });

          // Reset form
          setNewCategory({
            name: "",
            color: "#1976d2",
          });
        } else {
          setAlert({
            open: true,
            message: result.error || "Failed to add category",
            severity: "error",
          });
        }
      } catch (error) {
        setAlert({
          open: true,
          message: "An error occurred while adding the category",
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

  // Predefined colors for quick selection
  const predefinedColors = [
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#03A9F4",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
    "#FF5722",
    "#795548",
    "#9E9E9E",
    "#607D8B",
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Category Management
      </Typography>

      {/* Add new category */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Category
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="name"
              label="Category Name"
              value={newCategory.name}
              onChange={handleNewCategoryChange}
              variant="outlined"
              placeholder="e.g., Groceries, Rent, Entertainment"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  mr: 1,
                  bgcolor: newCategory.color,
                  borderRadius: 1,
                  cursor: "pointer",
                  border: "1px solid #ddd",
                }}
                onClick={() => setColorPickerOpen(true)}
              />
              <Button
                variant="outlined"
                onClick={() => setColorPickerOpen(true)}
                sx={{ flexGrow: 1 }}
              >
                Choose Color
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddCategory}
              disabled={!newCategory.name.trim()}
              fullWidth
            >
              Add Category
            </Button>
          </Grid>
        </Grid>

        {/* Quick color selection */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mt: 2, mb: 1 }}
          >
            Quick colors:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {predefinedColors.map((color) => (
              <Box
                key={color}
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: color,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    newCategory.color === color
                      ? "2px solid #000"
                      : "1px solid #ddd",
                }}
                onClick={() => setNewCategory({ ...newCategory, color })}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Existing categories */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Existing Categories
        </Typography>

        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category._id}>
              <Card variant="outlined">
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: category.color,
                        borderRadius: "50%",
                        mr: 1.5,
                      }}
                    />
                    <Typography variant="body1">{category.name}</Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" color="primary" disabled>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" disabled>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {categories.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="textSecondary">
                  No categories found. Add your first category above.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Color picker dialog */}
      <Dialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Select Category Color</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            {/* <SketchPicker
              color={newCategory.color}
              onChangeComplete={handleColorChange}
              disableAlpha
            /> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorPickerOpen(false)}>Cancel</Button>
          <Button onClick={() => setColorPickerOpen(false)} variant="contained">
            Select
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert */}
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
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CategoryManagement;
