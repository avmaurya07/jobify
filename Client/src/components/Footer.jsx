import { Box, Container, Typography, Link, Divider } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Footer = () => {
  return (
    <Box sx={{ bgcolor: "background.paper", py: 6, mt: "auto" }}>
      <Container maxWidth="lg">
        <Divider sx={{ mb: 4 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              Jobify
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect with opportunities and talent.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              © {new Date().getFullYear()} Jobify. All rights reserved.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                For Job Seekers
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Link
                  component={RouterLink}
                  to="/"
                  color="text.secondary"
                  underline="hover"
                >
                  Browse Jobs
                </Link>
                <Link
                  component={RouterLink}
                  to="/applications"
                  color="text.secondary"
                  underline="hover"
                >
                  Applications
                </Link>
                <Link
                  component={RouterLink}
                  to="/profile"
                  color="text.secondary"
                  underline="hover"
                >
                  Profile
                </Link>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                For Employers
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Link
                  component={RouterLink}
                  to="/post-job"
                  color="text.secondary"
                  underline="hover"
                >
                  Post a Job
                </Link>
                <Link
                  component={RouterLink}
                  to="/dashboard"
                  color="text.secondary"
                  underline="hover"
                >
                  Dashboard
                </Link>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Resources
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Link href="#" color="text.secondary" underline="hover">
                  Help Center
                </Link>
                <Link href="#" color="text.secondary" underline="hover">
                  Privacy Policy
                </Link>
                <Link href="#" color="text.secondary" underline="hover">
                  Terms of Service
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
