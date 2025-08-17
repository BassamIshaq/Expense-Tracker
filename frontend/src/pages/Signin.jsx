import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Link,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";
import axios from "axios";

const SignIn = () => {
  const location = useLocation();

  // Get redirect path from location state or default to dashboard
  const from = "/";

  useEffect(() => {
    // Check if user is already logged in
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      document.location.href = from; // Redirect to dashboard if already logged in
    }
  }, [from]);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Destructure form data
  const { email, password } = formData;

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

  // Toggle remember me
  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
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
      // Send login request
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      // Check if login was successful
      if (response.data.success) {
        // Store token in localStorage or sessionStorage based on rememberMe
        const storageMethod = rememberMe ? localStorage : sessionStorage;
        storageMethod.setItem("token", response.data.token);

        // Store user info
        storageMethod.setItem("user", JSON.stringify(response.data.user));

        setAlert({
          open: true,
          message: "Login successful! Redirecting...",
          severity: "success",
        });

        // Redirect to previous page or dashboard after short delay

        document.location.href = from; // Redirect to dashboard
      }
    } catch (error) {
      console.error("Login error:", error);

      setAlert({
        open: true,
        message:
          error.response?.data?.error ||
          "Invalid credentials. Please try again.",
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
    <div>
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Lock sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />

            <Typography component="h1" variant="h4" gutterBottom>
              Sign In
            </Typography>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Welcome back! Please login to your account
            </Typography>

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
                error={!!errors.email}
                helperText={errors.email}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
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

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      value="remember"
                      color="primary"
                      checked={rememberMe}
                      onChange={toggleRememberMe}
                    />
                  }
                  label="Remember me"
                />

                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                >
                  Forgot password?
                </Link>
              </Box>

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
                  "Sign In"
                )}
              </Button>

              <Grid container justifyContent="center">
                <Grid item>
                  <Typography variant="body2">
                    Don't have an account?{" "}
                    <Link component={RouterLink} to="/register" variant="body2">
                      Sign up
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="caption" color="textSecondary">
              Protected by reCAPTCHA and subject to the Privacy Policy and Terms
              of Service
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
    </div>
  );
};

export default SignIn;
