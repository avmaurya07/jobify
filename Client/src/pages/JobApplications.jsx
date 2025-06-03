import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import moment from "moment";
import { useJob } from "../context/JobContext";
import { useApplication } from "../context/ApplicationContext";

// Application status colors
const statusColors = {
  pending: "warning",
  shortlisted: "info",
  interviewed: "secondary",
  rejected: "error",
  hired: "success",
};

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { getJob, job, loading: jobLoading } = useJob();
  const {
    getJobApplications,
    applications,
    updateApplicationStatus,
    loading: applicationsLoading,
    error,
  } = useApplication();

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    feedback: "",
  });

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      await getJob(jobId);
      await getJobApplications(jobId);
    };

    fetchJobAndApplications();
  }, [jobId, getJob, getJobApplications]);

  const handleStatusUpdateOpen = (application) => {
    setSelectedApplication(application);
    setStatusUpdate({
      status: application.status,
      feedback: application.feedback || "",
    });
    setDialogOpen(true);
  };

  const handleStatusUpdateClose = () => {
    setDialogOpen(false);
    setSelectedApplication(null);
  };

  const handleStatusChange = (e) => {
    setStatusUpdate({
      ...statusUpdate,
      [e.target.name]: e.target.value,
    });
  };

  const handleStatusUpdateSubmit = async () => {
    await updateApplicationStatus(
      selectedApplication._id,
      statusUpdate.status,
      statusUpdate.feedback
    );
    setDialogOpen(false);
    // Refetch applications to show updated status
    await getJobApplications(jobId);
  };

  const isLoading = jobLoading || applicationsLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/dashboard")}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" gutterBottom>
            Applications for {job?.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Company: {job?.company} | Location: {job?.location} | Type:{" "}
            {job?.jobType}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Posted: {moment(job?.createdAt).format("MMMM D, YYYY")}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {applications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No applications received yet for this job.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              {applications.length} Application
              {applications.length !== 1 ? "s" : ""} Received
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
                    <TableCell>Applicant</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Applied On</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application._id}>
                      <TableCell>
                        <Typography variant="body1">
                          {application.applicant.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{application.applicant.email}</TableCell>
                      <TableCell>
                        {moment(application.createdAt).format("MMM D, YYYY")}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)
                          }
                          color={statusColors[application.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              handleStatusUpdateOpen(application);
                            }}
                          >
                            Update Status
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                              window.scrollTo(0, 0);
                              setSelectedApplication(application);
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {selectedApplication && !dialogOpen && (
          <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h5" gutterBottom>
                Application Details
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">
                {selectedApplication.applicant.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedApplication.applicant.email}
              </Typography>
              <Chip
                label={
                  selectedApplication.status.charAt(0).toUpperCase() +
                  selectedApplication.status.slice(1)
                }
                color={statusColors[selectedApplication.status]}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Cover Letter
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, backgroundColor: "rgba(0, 0, 0, 0.02)" }}
              >
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {selectedApplication.coverLetter}
                </Typography>
              </Paper>
            </Box>

            {selectedApplication.feedback && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Feedback
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                    {selectedApplication.feedback}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => handleStatusUpdateOpen(selectedApplication)}
              >
                Update Status
              </Button>
            </Box>
          </Paper>
        )}

        <Dialog open={dialogOpen} onClose={handleStatusUpdateClose}>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            {selectedApplication && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Applicant: {selectedApplication.applicant.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Current Status:{" "}
                  <Chip
                    label={
                      selectedApplication.status.charAt(0).toUpperCase() +
                      selectedApplication.status.slice(1)
                    }
                    color={statusColors[selectedApplication.status]}
                    size="small"
                  />
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>New Status</InputLabel>
                  <Select
                    name="status"
                    value={statusUpdate.status}
                    onChange={handleStatusChange}
                    label="New Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="shortlisted">Shortlisted</MenuItem>
                    <MenuItem value="interviewed">Interviewed</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="hired">Hired</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Feedback (optional)"
                  name="feedback"
                  multiline
                  rows={4}
                  value={statusUpdate.feedback}
                  onChange={handleStatusChange}
                  placeholder="Add feedback or notes about this application..."
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStatusUpdateClose}>Cancel</Button>
            <Button
              onClick={handleStatusUpdateSubmit}
              variant="contained"
              color="primary"
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default JobApplications;
