import React, { useState, useMemo } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  MenuItem,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import { useEffect } from "react";
import axios from "axios";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const MonthlyReport = () => {
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
    getExpenses();
    getCategories();
  }, []);

  // State for month/year selection
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Generate available months and years
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const yearList = [];

    // Include past 5 years and current year
    for (let i = currentYear - 5; i <= currentYear; i++) {
      yearList.push(i);
    }

    return yearList;
  }, [currentDate]);

  // Filter expenses for selected month and year
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === selectedMonth &&
        expenseDate.getFullYear() === selectedYear
      );
    });
  }, [expenses, selectedMonth, selectedYear]);

  // Calculate total for the month
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    const categoryMap = {};

    filteredExpenses.forEach((expense) => {
      if (categoryMap[expense.category]) {
        categoryMap[expense.category] += expense.amount;
      } else {
        categoryMap[expense.category] = expense.amount;
      }
    });

    return categoryMap;
  }, [filteredExpenses]);

  // Group expenses by day of month
  const expensesByDay = useMemo(() => {
    const dayMap = {};

    // Initialize all days of the month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      dayMap[i] = 0;
    }

    // Fill in actual expense data
    filteredExpenses.forEach((expense) => {
      const day = new Date(expense.date).getDate();
      dayMap[day] += expense.amount;
    });

    return dayMap;
  }, [filteredExpenses, selectedMonth, selectedYear]);

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

  // Prepare data for daily expenses bar chart
  const barChartData = useMemo(() => {
    return {
      labels: Object.keys(expensesByDay),
      datasets: [
        {
          label: "Daily Expenses",
          data: Object.values(expensesByDay),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [expensesByDay]);

  // Prepare data for cumulative spending line chart
  const lineChartData = useMemo(() => {
    const days = Object.keys(expensesByDay);
    const dailyAmounts = Object.values(expensesByDay);

    // Calculate cumulative sum
    const cumulativeData = [];
    let runningTotal = 0;

    dailyAmounts.forEach((amount) => {
      runningTotal += amount;
      cumulativeData.push(runningTotal);
    });

    return {
      labels: days,
      datasets: [
        {
          label: "Cumulative Spending",
          data: cumulativeData,
          fill: true,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          tension: 0.1,
        },
      ],
    };
  }, [expensesByDay]);

  // Export monthly report
  const handleExportReport = () => {
    exportToPDF(
      filteredExpenses,
      `Expense Report - ${months[selectedMonth]} ${selectedYear}`
    );
  };

  // Export raw data as CSV
  const handleExportCSV = () => {
    exportToCSV(filteredExpenses);
  };

  return (
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
          Monthly Report
        </Typography>
        <Box>
          <Button
            onClick={handleExportCSV}
            startIcon={<DownloadIcon />}
            sx={{ mr: 1 }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            onClick={handleExportReport}
            startIcon={<DownloadIcon />}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Month/Year selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5} md={4}>
            <TextField
              select
              label="Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              fullWidth
            >
              {months.map((month, index) => (
                <MenuItem key={month} value={index}>
                  {month}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={5} md={4}>
            <TextField
              select
              label="Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              fullWidth
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2} md={4}>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedMonth(currentDate.getMonth());
                setSelectedYear(currentDate.getFullYear());
              }}
              fullWidth
            >
              Current Month
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" color="primary">
                ${totalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {months[selectedMonth]} {selectedYear}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Number of Expenses
              </Typography>
              <Typography variant="h4" color="secondary">
                {filteredExpenses.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                transactions recorded
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Expense
              </Typography>
              <Typography variant="h4" style={{ color: "#4CAF50" }}>
                $
                {filteredExpenses.length
                  ? (totalAmount / filteredExpenses.length).toFixed(2)
                  : "0.00"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                per transaction
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              <Typography variant="h4" style={{ color: "#FF9800" }}>
                {Object.keys(expensesByCategory).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                different spending categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      {filteredExpenses.length > 0 ? (
        <Grid container spacing={3}>
          {/* Category breakdown */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Spending by Category</Typography>
                <Tooltip title="Shows how your spending is distributed across different categories">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{ height: 300, display: "flex", justifyContent: "center" }}
              >
                <Pie
                  data={pieChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                      },
                    },
                  }}
                />
              </Box>

              {/* Category breakdown table */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Category Breakdown
                </Typography>
                <Divider />
                {Object.entries(expensesByCategory)
                  .sort((a, b) => b[1] - a[1]) // Sort by amount (descending)
                  .map(([category, amount]) => (
                    <Box
                      key={category}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                      }}
                    >
                      <Typography variant="body2">{category}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          ${amount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          ({((amount / totalAmount) * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Box>
                  ))}
              </Box>
            </Paper>
          </Grid>

          {/* Daily spending */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Daily Expenses</Typography>
                <Tooltip title="Shows your spending pattern across the days of the month">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <Bar
                  data={barChartData}
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
                      x: {
                        title: {
                          display: true,
                          text: "Day of Month",
                        },
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Cumulative spending */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Cumulative Spending</Typography>
                <Tooltip title="Shows how your spending accumulates throughout the month">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <Line
                  data={lineChartData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Cumulative Amount ($)",
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Day of Month",
                        },
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No expenses found for {months[selectedMonth]} {selectedYear}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Add some expenses to see your monthly report.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default MonthlyReport;
