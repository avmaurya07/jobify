import { useState } from "react";
import { Outlet, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import WorkIcon from "@mui/icons-material/Work";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useAuth } from "../context/AuthContext";
import Footer from "./Footer";

const Layout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Navigation options based on user role
  const getNavigationItems = () => {
    const items = [{ label: "Jobs", href: "/", icon: <WorkIcon /> }];

    if (isAuthenticated) {
      if (user.role === "user") {
        items.push({
          label: "My Applications",
          href: "/applications",
          icon: <PostAddIcon />,
        });
      }

      if (["recruiter", "admin"].includes(user.role)) {
        items.push(
          { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
          { label: "Post Job", href: "/post-job", icon: <PostAddIcon /> }
        );
      }

      if (user.role === "admin") {
        items.push({
          label: "Admin Panel",
          href: "/admin",
          icon: <AdminPanelSettingsIcon />,
        });
      }
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Box sx={{ display: "flex", p: 2, alignItems: "center" }}>
        <WorkIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap component="div">
          Jobify
        </Typography>
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={RouterLink} to={item.href}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {isAuthenticated && (
        <>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/profile">
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo for desktop */}
            <WorkIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Jobify
            </Typography>

            {/* Mobile menu */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="open drawer"
                edge="start"
                color="inherit"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                  display: { xs: "block", md: "none" },
                  "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
                }}
              >
                {drawer}
              </Drawer>
            </Box>

            {/* Logo for mobile */}
            <WorkIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Jobify
            </Typography>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  component={RouterLink}
                  to={item.href}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                  startIcon={item.icon}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* User menu */}
            {isAuthenticated ? (
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={user?.name}
                      src="/static/images/avatar/2.jpg"
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1">{user?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem
                    component={RouterLink}
                    to="/profile"
                    onClick={handleCloseUserMenu}
                  >
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleLogout();
                      handleCloseUserMenu();
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ flexGrow: 0, display: "flex", gap: 2 }}>
                <Button color="inherit" component={RouterLink} to="/login">
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  component={RouterLink}
                  to="/register"
                  sx={{ color: "white" }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
};

export default Layout;
