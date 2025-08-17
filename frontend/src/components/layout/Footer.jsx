import React from "react";
import { Box, Container, Typography, Link as MuiLink } from "@mui/material";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        mt: "auto",
        backgroundColor: (theme) => theme.palette.grey[200],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          Expense Tracker by Muhamamd Bassam Ishaq
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
