import React from "react";
import { Container, Typography, Box, Button, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: "center" }}>
        <ErrorOutlineIcon sx={{ fontSize: 100, color: "#f44336", mb: 2 }} />

        <Typography variant="h3" component="h1" gutterBottom>
          404 - Page Not Found
        </Typography>

        <Typography variant="h6" color="textSecondary" paragraph>
          Oops! The page you're looking for doesn't exist.
        </Typography>

        <Typography variant="body1" color="textSecondary" paragraph>
          The page might have been moved, deleted, or never existed.
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/"
            size="large"
          >
            Back to Dashboard
          </Button>
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mt: 4 }}>
          Error timestamp: {new Date().toLocaleString()}
        </Typography>
      </Paper>
    </Container>
  );
};

export default NotFound;
