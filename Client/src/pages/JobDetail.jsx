import { useState, useEffect } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useJob } from "../context/JobContext";
import { useApplication } from "../context/ApplicationContext";
import { useAuth } from "../context/AuthContext";
import moment from "moment";

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { job, loading: jobLoading, getJob } = useJob();
  const { applyForJob, loading: applicationLoading, error } = useApplication();
  const { isAuthenticated, user } = useAuth();

  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    resume: "",
  });
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (jobId) {
      getJob(jobId);
    }
  }, [jobId]);

  const handleApplyOpen = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setOpenApplyDialog(true);
  };

  const handleApplyClose = () => {
    setOpenApplyDialog(false);
  };

  const handleInputChange = (e) => {
    setApplicationData({
      ...applicationData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!applicationData.coverLetter) {
      setFormError("Cover letter is required");
      return;
    }

    try {
      await applyForJob(jobId, applicationData);
      setApplicationSuccess(true);
      setTimeout(() => {
        handleApplyClose();
        setApplicationSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  if (jobLoading || !job) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  const isRecruiter =
    isAuthenticated &&
    ["recruiter", "admin"].includes(user?.role) &&
    (user?._id === job.createdBy || user?.role === "admin");

  const isJobClosed = job.status === "closed";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography variant="h4" gutterBottom>
                  {job.title}
                </Typography>
                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <BusinessIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="subtitle1">{job.company}</Typography>
                </Box>
                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <LocationOnIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    {job.location}
                  </Typography>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                  <Chip
                    icon={<WorkIcon />}
                    label={job.jobType}
                    variant="outlined"
                    size="small"
                  />
                  {job.status === "open" ? (
                    <Chip label="Active" color="success" size="small" />
                  ) : (
                    <Chip label="Closed" color="error" size="small" />
                  )}
                </Box>
              </Box>

              <Box>
                {job.salary && (
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <AttachMoneyIcon
                      fontSize="small"
                      sx={{ mr: 0.5, color: "success.main" }}
                    />
                    <Typography
                      variant="subtitle1"
                      color="success.main"
                      fontWeight="bold"
                    >
                      {job.salary}
                    </Typography>
                  </Box>
                )}
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  <CalendarTodayIcon
                    fontSize="small"
                    sx={{ mr: 0.5, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Posted {moment(job.createdAt).fromNow()}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {isRecruiter && (
              <Box sx={{ mt: 3, mb: 3, display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to={`/edit-job/${job._id}`}
                >
                  Edit Job
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={RouterLink}
                  to={`/job-applications/${job._id}`}
                >
                  View Applications
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom>
              Job Description
            </Typography>
            <Typography variant="body1" paragraph>
              {job.description}
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Requirements
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              {job.requirements && job.requirements.length > 0 ? (
                job.requirements.map((req, index) => (
                  <Typography
                    component="li"
                    key={index}
                    variant="body1"
                    paragraph
                  >
                    {req}
                  </Typography>
                ))
              ) : (
                <Typography variant="body1">
                  No specific requirements listed.
                </Typography>
              )}
            </Box>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Skills
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {job.skills && job.skills.length > 0 ? (
                job.skills.map((skill, index) => (
                  <Chip key={index} label={skill} />
                ))
              ) : (
                <Typography variant="body1">
                  No specific skills listed.
                </Typography>
              )}
            </Box>
          </Paper>

          {!isRecruiter && isAuthenticated && user?.role === "user" && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleApplyOpen}
                disabled={isJobClosed}
              >
                {isJobClosed
                  ? "Job is no longer accepting applications"
                  : "Apply for this job"}
              </Button>
            </Box>
          )}

          {!isAuthenticated && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Interested in this job?
                </Typography>
                <Typography variant="body1" paragraph>
                  Please sign in to submit your application.
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/login"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="outlined"
                    component={RouterLink}
                    to="/register"
                  >
                    Create Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Company Information
            </Typography>
            <Typography variant="body1" paragraph>
              {job.company}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Location: {job.location}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Job Summary
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Job Type
                </Typography>
                <Typography variant="body2">{job.jobType}</Typography>
              </Box>
              {job.salary && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Salary
                  </Typography>
                  <Typography variant="body2">{job.salary}</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Date Posted
                </Typography>
                <Typography variant="body2">
                  {moment(job.createdAt).format("MMM DD, YYYY")}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Similar Jobs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Find more opportunities like this one.
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              color="primary"
              component={RouterLink}
              to="/"
              sx={{ mt: 2 }}
            >
              Browse All Jobs
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Apply Dialog */}
      <Dialog
        open={openApplyDialog}
        onClose={handleApplyClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Apply for {job.title}</DialogTitle>
        <DialogContent>
          {applicationSuccess ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Your application has been submitted successfully!
              </Alert>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <DialogContentText gutterBottom>
                Complete your application for {job.title} at {job.company}.
              </DialogContentText>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleApplySubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Cover Letter"
                  name="coverLetter"
                  multiline
                  rows={8}
                  value={applicationData.coverLetter}
                  onChange={handleInputChange}
                  required
                  placeholder="Explain why you are a good fit for this position..."
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Resume Link (Optional)"
                  name="resume"
                  value={applicationData.resume}
                  onChange={handleInputChange}
                  placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                />

                <DialogActions sx={{ px: 0, mt: 2 }}>
                  <Button
                    onClick={handleApplyClose}
                    disabled={applicationLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={applicationLoading}
                  >
                    {applicationLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </DialogActions>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default JobDetail;
