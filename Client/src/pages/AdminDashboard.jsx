import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useJob } from "../context/JobContext";
import { useApplication } from "../context/ApplicationContext";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import StatCard from "../components/StatCard";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const { getJobStats, stats: jobStats, loading: jobLoading } = useJob();
  const {
    getApplicationStats,
    stats: appStats,
    loading: appLoading,
  } = useApplication();

  useEffect(() => {
    getJobStats();
    getApplicationStats();
  }, []);

  const isLoading = jobLoading || appLoading || !jobStats || !appStats;

  // Data for job status chart
  const jobStatusData = {
    labels: ["Open", "Closed"],
    datasets: [
      {
        label: "Job Status",
        data: isLoading
          ? [0, 0]
          : [jobStats.byStatus.open, jobStats.byStatus.closed],
        backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Data for job types chart
  const jobTypesData = {
    labels: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
    datasets: [
      {
        label: "Job Types",
        data: isLoading
          ? [0, 0, 0, 0, 0]
          : [
              jobStats.byJobType.fullTime,
              jobStats.byJobType.partTime,
              jobStats.byJobType.contract,
              jobStats.byJobType.internship,
              jobStats.byJobType.remote,
            ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
      },
    ],
  };

  // Data for application status chart
  const applicationStatusData = {
    labels: ["Pending", "Shortlisted", "Interviewed", "Rejected", "Hired"],
    datasets: [
      {
        label: "Application Status",
        data: isLoading
          ? [0, 0, 0, 0, 0]
          : [
              appStats.byStatus.pending,
              appStats.byStatus.shortlisted,
              appStats.byStatus.interviewed,
              appStats.byStatus.rejected,
              appStats.byStatus.hired,
            ],
        backgroundColor: [
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
      },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.name}! Here's an overview of the job portal.
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Jobs"
                value={jobStats.totalJobs}
                color="#2563eb"
                icon="work"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Open Jobs"
                value={jobStats.byStatus.open}
                color="#16a34a"
                icon="check_circle"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Applications"
                value={appStats.totalApplications}
                color="#ea580c"
                icon="description"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Hired Candidates"
                value={appStats.byStatus.hired}
                color="#8b5cf6"
                icon="person"
              />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Job Status Distribution
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Doughnut
                      data={jobStatusData}
                      options={{ maintainAspectRatio: false }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Application Status
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Doughnut
                      data={applicationStatusData}
                      options={{ maintainAspectRatio: false }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Job Types
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar
                      data={jobTypesData}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Jobs
                    </Typography>
                    {jobStats.recentJobs?.length > 0 ? (
                      jobStats.recentJobs.map((job, index) => (
                        <Box key={job._id} sx={{ py: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="subtitle1">
                              {job.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {job.status}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {job.company} • {job.location}
                          </Typography>
                          {index < jobStats.recentJobs.length - 1 && (
                            <Divider sx={{ my: 1 }} />
                          )}
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No recent jobs found.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Applications
                    </Typography>
                    {appStats.recentApplications?.length > 0 ? (
                      appStats.recentApplications.map((app, index) => (
                        <Box key={app._id} sx={{ py: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="subtitle1">
                              {app.applicant.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  app.status === "hired"
                                    ? "success.main"
                                    : app.status === "rejected"
                                    ? "error.main"
                                    : "text.secondary",
                              }}
                            >
                              {app.status.charAt(0).toUpperCase() +
                                app.status.slice(1)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Applied for: {app.job.title} at {app.job.company}
                          </Typography>
                          {index < appStats.recentApplications.length - 1 && (
                            <Divider sx={{ my: 1 }} />
                          )}
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No recent applications found.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
