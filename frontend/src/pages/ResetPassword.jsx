import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Link,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { Visibility, VisibilityOff, LockReset } from "@mui/icons-material";
import axios from "axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetToken } = useParams();

  // Form state
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Destructure form data
  const { password, confirmPassword } = formData;

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!resetToken) {
        setIsTokenValid(false);
        return;
      }

      try {
        // This would be an actual endpoint to verify the token validity
        // For now, we'll just simulate it with a timeout
        setIsLoading(true);

        // Simulate API call to verify token
        setTimeout(() => {
          setIsLoading(false);
          setIsTokenValid(true);
        }, 1000);

        // In a real app, you would do something like this:
        // await axios.get(`/api/auth/verify-reset-token/${resetToken}`);
      } catch (error) {
        console.error("Token verification error:", error);
        setIsTokenValid(false);
        setAlert({
          open: true,
          message: "This password reset link is invalid or has expired.",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [resetToken]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      });
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Send password reset request
      const response = await axios.put(
        `/api/auth/reset-password/${resetToken}`,
        {
          password,
        }
      );

      // Check if reset was successful
      if (response.data.success) {
        setIsSubmitted(true);

        setAlert({
          open: true,
          message: "Your password has been reset successfully!",
          severity: "success",
        });

        // Redirect to login after delay
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Password reset error:", error);

      setAlert({
        open: true,
        message:
          error.response?.data?.error ||
          "Failed to reset password. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlert({
      ...alert,
      open: false,
    });
  };

  // Show loading indicator while verifying token
  if (isLoading && !isSubmitted) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6">Verifying your reset link...</Typography>
        </Paper>
      </Container>
    );
  }

  // Show error if token is invalid
  if (!isTokenValid && !isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
        >
          <LockReset sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Invalid Reset Link
          </Typography>
          <Typography variant="body1" paragraph>
            This password reset link is invalid or has expired.
          </Typography>
          <Button
            component={RouterLink}
            to="/forgot-password"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Request New Reset Link
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <LockReset sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />

          <Typography component="h1" variant="h4" gutterBottom>
            Reset Password
          </Typography>

          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mb: 3, textAlign: "center" }}
          >
            {isSubmitted
              ? "Your password has been reset successfully!"
              : "Create a new password for your account"}
          </Typography>

          {!isSubmitted ? (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%", mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.2 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </Box>
          ) : (
            <Box sx={{ width: "100%", mt: 2 }}>
              <Button
                component={RouterLink}
                to="/login"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 1, mb: 2 }}
              >
                Go to Sign In
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="caption" color="textSecondary">
            Remember your password?{" "}
            <Link component={RouterLink} to="/login" variant="caption">
              Sign in to your account
            </Link>
          </Typography>
        </Box>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="caption" color="textSecondary">
            Last updated: 2025-08-17 06:34:45
          </Typography>
        </Box>
      </Paper>

      {/* Alert for success/error messages */}
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

export default ResetPassword;
