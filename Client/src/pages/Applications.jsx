import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useApplication } from "../context/ApplicationContext";
import moment from "moment";

// Application status chip component
const StatusChip = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case "pending":
        return "default";
      case "shortlisted":
        return "info";
      case "interviewed":
        return "warning";
      case "rejected":
        return "error";
      case "hired":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={getColor()}
      size="small"
    />
  );
};

const Applications = () => {
  const { applications, getUserApplications, loading } = useApplication();
  const [selectedApp, setSelectedApp] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    getUserApplications();
  }, []);

  const handleOpenDialog = (application) => {
    setSelectedApp(application);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Applications
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Track the status of your job applications
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {applications && applications.length > 0 ? (
        <Grid container spacing={3}>
          {applications.map((application) => (
            <Grid item xs={12} sm={6} md={4} key={application._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="h2" gutterBottom>
                      {application.job.title}
                    </Typography>
                    <StatusChip status={application.status} />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {application.job.company}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Applied on{" "}
                    {moment(application.createdAt).format("MMM D, YYYY")}
                  </Typography>

                  {application.feedback && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Feedback:</Typography>
                      <Typography variant="body2">
                        {application.feedback}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      mt: "auto",
                      pt: 2,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      size="small"
                      onClick={() => handleOpenDialog(application)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      color="primary"
                      component={RouterLink}
                      to={`/jobs/${application.job._id}`}
                    >
                      View Job
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            You haven't applied to any jobs yet
          </Typography>
          <Typography variant="body1" paragraph>
            Apply for jobs to see your applications here.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/"
          >
            Browse Jobs
          </Button>
        </Paper>
      )}

      {/* Application Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedApp && (
          <>
            <DialogTitle>Application Details</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">{selectedApp.job.title}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {selectedApp.job.company}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mr: 1 }}
                  >
                    Status:
                  </Typography>
                  <StatusChip status={selectedApp.status} />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <DialogContentText variant="subtitle1" gutterBottom>
                Cover Letter:
              </DialogContentText>
              <Paper
                variant="outlined"
                sx={{ p: 2, mb: 3, bgcolor: "background.default" }}
              >
                <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                  {selectedApp.coverLetter}
                </Typography>
              </Paper>

              {selectedApp.resume && (
                <>
                  <DialogContentText variant="subtitle1" gutterBottom>
                    Resume:
                  </DialogContentText>
                  <Button
                    variant="outlined"
                    href={selectedApp.resume}
                    target="_blank"
                    rel="noopener"
                  >
                    Open Resume
                  </Button>
                </>
              )}

              {selectedApp.feedback && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <DialogContentText variant="subtitle1" gutterBottom>
                    Feedback from Recruiter:
                  </DialogContentText>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, bgcolor: "background.default" }}
                  >
                    <Typography variant="body2">
                      {selectedApp.feedback}
                    </Typography>
                  </Paper>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button
                color="primary"
                component={RouterLink}
                to={`/jobs/${selectedApp.job._id}`}
                onClick={handleCloseDialog}
              >
                View Job Posting
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Applications;
