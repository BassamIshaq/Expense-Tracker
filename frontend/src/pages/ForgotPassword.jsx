import React, { useState } from "react";
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
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { LockReset } from "@mui/icons-material";
import axios from "axios";

const ForgotPassword = () => {
  // Form state
  const [email, setEmail] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Error state
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  // Validate form
  const validateForm = () => {
    if (!email) {
      setError("Email is required");
      return false;
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
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
      const response = await axios.post("/api/auth/forgot-password", { email });

      // Check if request was successful
      if (response.data.success) {
        setIsSubmitted(true);

        setAlert({
          open: true,
          message: "Reset instructions sent to your email address!",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);

      setAlert({
        open: true,
        message:
          error.response?.data?.error ||
          "Error sending reset email. Please try again.",
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
            Forgot Password
          </Typography>

          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mb: 3, textAlign: "center" }}
          >
            {isSubmitted
              ? "Check your email for a link to reset your password."
              : "Enter your email address and we'll send you a link to reset your password."}
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
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={handleChange}
                error={!!error}
                helperText={error}
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
                  "Send Reset Link"
                )}
              </Button>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Back to Sign In
                </Link>
              </Box>
            </Box>
          ) : (
            <Box sx={{ width: "100%", mt: 2 }}>
              <Button
                component={RouterLink}
                to="/login"
                fullWidth
                variant="outlined"
                size="large"
                sx={{ mt: 1, mb: 2 }}
              >
                Return to Sign In
              </Button>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="body2" color="textSecondary">
                  Didn't receive the email?{" "}
                  <Link
                    href="#"
                    variant="body2"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsSubmitted(false);
                    }}
                  >
                    Try again
                  </Link>
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="caption" color="textSecondary">
            If you don't have an account,{" "}
            <Link component={RouterLink} to="/register" variant="caption">
              sign up for an account
            </Link>
          </Typography>
        </Box>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="caption" color="textSecondary">
            Last updated: 2025-08-16 13:00:54
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

export default ForgotPassword;
