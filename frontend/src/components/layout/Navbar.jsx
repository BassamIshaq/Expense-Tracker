import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  AccountBalanceWallet as WalletIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Get first letter of username for avatar
  const userInitial =
    user && user.username ? user.username.charAt(0).toUpperCase() : "U";

  // Open user menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close user menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  // Navigate to login page
  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <WalletIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            Expense Tracker
          </Link>
        </Typography>

        {isAuthenticated ? (
          <>
            <Box sx={{ display: { xs: "none", sm: "flex" } }}>
              <Button color="inherit" component={Link} to="/">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/expenses">
                Expenses
              </Button>
              <Button color="inherit" component={Link} to="/add-expense">
                Add Expense
              </Button>
              <Button color="inherit" component={Link} to="/reports">
                Reports
              </Button>
              <Button color="inherit" component={Link} to="/categories">
                Categories
              </Button>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? "user-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <Avatar
                  sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}
                >
                  {userInitial}
                </Avatar>
              </IconButton>

              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1">
                    {user?.username || "BassamIshaq"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user?.email || "bassam@example.com"}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem component={Link} to="/" onClick={handleMenuClose}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleMenuClose}
                >
                  <ListItemIcon>
                    <AccountIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/settings"
                  onClick={handleMenuClose}
                >
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </>
        ) : (
          <Box>
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={handleLogin}
            >
              Sign In
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
