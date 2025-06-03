import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useJob } from "../context/JobContext";
import { useApplication } from "../context/ApplicationContext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import moment from "moment";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const { user } = useAuth();
  const { getRecruiterJobs, jobs, loading: jobsLoading, deleteJob } = useJob();
  const { loading: applicationLoading } = useApplication();

  const [anchorElMap, setAnchorElMap] = useState({});
  const [jobToDelete, setJobToDelete] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    getRecruiterJobs();
  }, []);

  const handleMenuOpen = (jobId) => (event) => {
    setAnchorElMap((prev) => ({
      ...prev,
      [jobId]: event.currentTarget,
    }));
  };

  const handleMenuClose = (jobId) => {
    setAnchorElMap((prev) => ({
      ...prev,
      [jobId]: null,
    }));
  };

  const handleDeleteClick = (jobId) => {
    setJobToDelete(jobId);
    handleMenuClose(jobId);
    // You'd typically show a confirmation dialog here
    // For simplicity, we'll just delete directly
    if (confirmed) {
      deleteJob(jobId);
    }
  };

  // Calculate some basic stats
  const openJobs = jobs?.filter((job) => job.status === "open").length || 0;
  const closedJobs = jobs?.filter((job) => job.status === "closed").length || 0;
  const totalJobs = jobs?.length || 0;

  const isLoading = jobsLoading || applicationLoading;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Recruiter Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.name}! Manage your job postings and applications.
        </Typography>
      </Box>

      {/* Action Button */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/post-job"
        >
          Post a New Job
        </Button>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Jobs Posted"
            value={totalJobs}
            color="#2563eb"
            icon="work"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Jobs"
            value={openJobs}
            color="#16a34a"
            icon="check_circle"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Closed Jobs"
            value={closedJobs}
            color="#dc2626"
            icon="cancel"
          />
        </Grid>
      </Grid>

      {/* Job Listings */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Your Job Postings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
            <CircularProgress />
          </Box>
        ) : jobs && jobs.length > 0 ? (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Job Title</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Posted On</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job._id} hover>
                    <TableCell component="th" scope="row">
                      {job.title}
                    </TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>
                      {moment(job.createdAt).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.status === "open" ? "Active" : "Closed"}
                        color={job.status === "open" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <IconButton
                          component={RouterLink}
                          to={`/jobs/${job._id}`}
                          size="small"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          component={RouterLink}
                          to={`/edit-job/${job._id}`}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleMenuOpen(job._id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <Menu
                          anchorEl={anchorElMap[job._id]}
                          open={Boolean(anchorElMap[job._id])}
                          onClose={() => handleMenuClose(job._id)}
                        >
                          <MenuItem
                            component={RouterLink}
                            to={`/job-applications/${job._id}`}
                          >
                            <ListItemIcon>
                              <VisibilityIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>View Applications</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => handleDeleteClick(job._id)}>
                            <ListItemIcon>
                              <DeleteIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Delete Job</ListItemText>
                          </MenuItem>
                        </Menu>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" gutterBottom>
                You haven't posted any jobs yet
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Create your first job posting to start receiving applications.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/post-job"
              >
                Post a New Job
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
