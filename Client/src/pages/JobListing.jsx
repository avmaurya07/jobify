import { useState } from "react";
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  Box,
  Button,
  MenuItem,
  InputAdornment,
  IconButton,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import { useJob } from "../context/JobContext";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const JobListing = () => {
  const { jobs, loading, getJobs } = useJob();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    jobType: "",
    status: "open",
  });
  const [jobsPerPage] = useState(5);

  useEffect(() => {
    getJobs(filters);
  }, []);

  const handleSearchChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    getJobs(filters);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Get current jobs
  const indexOfLastJob = page * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const jobTypes = [
    { value: "", label: "All Job Types" },
    { value: "Full-time", label: "Full-time" },
    { value: "Part-time", label: "Part-time" },
    { value: "Contract", label: "Contract" },
    { value: "Internship", label: "Internship" },
    { value: "Remote", label: "Remote" },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Find Your Dream Job
      </Typography>

      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              name="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Job title, company, or keywords"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              name="location"
              value={filters.location}
              onChange={handleSearchChange}
              placeholder="Location"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              select
              fullWidth
              name="jobType"
              value={filters.jobType}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon />
                  </InputAdornment>
                ),
              }}
            >
              {jobTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Typography>Loading jobs...</Typography>
      ) : jobs.length === 0 ? (
        <Box sx={{ textAlign: "center", my: 5 }}>
          <Typography variant="h6" color="textSecondary">
            No jobs found. Try adjusting your search criteria.
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="textSecondary">
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"} found
            </Typography>
          </Box>

          {currentJobs.map((job) => (
            <Card key={job._id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container>
                  <Grid item xs={12} md={9}>
                    <Typography gutterBottom variant="h5" component="div">
                      {job.title}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      gutterBottom
                    >
                      {job.company} • {job.location}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <WorkIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.jobType}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                      {job.description.length > 200
                        ? `${job.description.substring(0, 200)}...`
                        : job.description}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {job.skills.slice(0, 4).map((skill, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          sx={{
                            bgcolor: "rgba(0, 0, 0, 0.08)",
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          {skill}
                        </Typography>
                      ))}
                      {job.skills.length > 4 && (
                        <Typography
                          variant="body2"
                          sx={{
                            bgcolor: "rgba(0, 0, 0, 0.08)",
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          +{job.skills.length - 4} more
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={3}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", md: "flex-end" },
                      mt: { xs: 2, md: 0 },
                    }}
                  >
                    {job.salary && (
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        {job.salary}
                      </Typography>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to={`/jobs/${job._id}`}
                      sx={{ mt: { xs: 2, md: 0 } }}
                    >
                      View Details
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={Math.ceil(jobs.length / jobsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default JobListing;
