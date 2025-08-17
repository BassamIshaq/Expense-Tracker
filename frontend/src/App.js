import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import axios from 'axios';

// Auth components
import SignIn from './pages/Signin';
import SignUp from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page components
import Dashboard from './pages/Dashboard';
import ExpenseList from './pages/ExpenseList';
import AddExpense from './pages/AddExpense';
import MonthlyReport from './pages/MonthlyReport';
import CategoryManagement from './pages/CategoryManagement';
import NotFound from './pages/NotFound';

// CSS
import './App.css';

// Set base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Check if we have a token and set the default header
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <div className="app">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<SignIn />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Container className="main-content">
                      <Dashboard />
                    </Container>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Container className="main-content">
                      <ExpenseList />
                    </Container>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/add-expense" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Container className="main-content">
                      <AddExpense />
                    </Container>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Container className="main-content">
                      <MonthlyReport />
                    </Container>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/categories" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Container className="main-content">
                      <CategoryManagement />
                    </Container>
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              
              {/* 404 and Redirects */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;