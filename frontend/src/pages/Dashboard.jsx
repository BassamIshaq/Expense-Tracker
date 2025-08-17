import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Box,
  Button,
  Chip,
} from "@mui/material";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import DownloadIcon from "@mui/icons-material/Download";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Link } from "react-router-dom";
import { getCurrentMonthRange } from "../utils/dateUtils";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import axios from "axios";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard = ({ isLoading, lastUpdated }) => {
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

  const { start, end } = getCurrentMonthRange();

  // Filter expenses for current month
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= start && expDate <= end;
    });
  }, [expenses, start, end]);

  // Calculate total for current month
  const totalAmount = useMemo(() => {
    return currentMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
  }, [currentMonthExpenses]);

  // Get expense data by category
  const expensesByCategory = useMemo(() => {
    const categoryMap = {};

    currentMonthExpenses.forEach((expense) => {
      if (categoryMap[expense.category]) {
        categoryMap[expense.category] += expense.amount;
      } else {
        categoryMap[expense.category] = expense.amount;
      }
    });

    return categoryMap;
  }, [currentMonthExpenses]);

  // Prepare data for pie chart
  const pieChartData = useMemo(() => {
    const labels = Object.keys(expensesByCategory);
    const data = Object.values(expensesByCategory);

    // Get colors from categories array if available
    const colors = labels.map((label) => {
      const category = categories.find((cat) => cat.name === label);
      return category
        ? category.color
        : `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 1,
        },
      ],
    };
  }, [expensesByCategory, categories]);

  // Prepare data for recent transactions
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [expenses]);

  // Prepare data for bar chart (last 7 days)
  const last7DaysData = useMemo(() => {
    const today = new Date();
    const days = [];
    const values = [];

    // Create array of last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      days.push(dayName);

      // Calculate total for this day
      const dayTotal = expenses
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return (
            expDate.getDate() === date.getDate() &&
            expDate.getMonth() === date.getMonth() &&
            expDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      values.push(dayTotal);
    }

    return {
      labels: days,
      datasets: [
        {
          label: "Daily Spending",
          data: values,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [expenses]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Header with actions */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleIcon />}
                component={Link}
                to="/add-expense"
                sx={{ mr: 1 }}
              >
                Add Expense
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  exportToPDF(currentMonthExpenses, "Monthly Expense Report")
                }
              >
                Export Report
              </Button>
            </Box>
          </Box>
          <Typography variant="body2" color="textSecondary">
            Last updated: {lastUpdated}
          </Typography>
        </Grid>

        {/* Monthly summary */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              This Month
            </Typography>
            <Typography component="p" variant="h3">
              ${totalAmount.toFixed(2)}
            </Typography>
            <Typography color="textSecondary" sx={{ flex: 1 }}>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Typography>
            <div>
              <Chip
                label={`${Object.keys(expensesByCategory).length} Categories`}
                color="primary"
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip
                label={`${currentMonthExpenses.length} Expenses`}
                color="secondary"
                size="small"
              />
            </div>
          </Paper>
        </Grid>

        {/* Pie chart */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Spending by Category
            </Typography>
            <Box
              sx={{ height: 180, display: "flex", justifyContent: "center" }}
            >
              {Object.keys(expensesByCategory).length > 0 ? (
                <Pie
                  data={pieChartData}
                  options={{ maintainAspectRatio: false }}
                />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    No data available for this month
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent transactions */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={3}
            sx={{ p: 2, display: "flex", flexDirection: "column" }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Recent Transactions
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense, index) => (
                <Box key={index} sx={{ mb: 1.5 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body1">
                      {expense.description || expense.category}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${expense.amount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {new Date(expense.date).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={expense.category}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        backgroundColor:
                          categories.find((c) => c.name === expense.category)
                            ?.color || "#757575",
                      }}
                    />
                  </Box>
                  {index < recentExpenses.length - 1 && (
                    <Divider sx={{ my: 1.5 }} />
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary" align="center">
                No recent transactions
              </Typography>
            )}

            {expenses.length > 5 && (
              <Button
                component={Link}
                to="/expenses"
                sx={{ mt: 2, alignSelf: "flex-end" }}
              >
                View All
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Weekly chart */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={3}
            sx={{ p: 2, display: "flex", flexDirection: "column" }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Last 7 Days Spending
            </Typography>
            <Box sx={{ height: 250, mt: 1 }}>
              <Bar
                data={last7DaysData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Amount ($)",
                      },
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
