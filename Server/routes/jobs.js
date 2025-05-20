const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const Job = require("../models/Job");

// @route   POST api/jobs
// @desc    Create a job
// @access  Private (recruiters and admins only)
router.post(
  "/",
  [
    auth,
    checkRole(["recruiter", "admin"]),
    [
      check("title", "Title is required").not().isEmpty(),
      check("description", "Description is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("location", "Location is required").not().isEmpty(),
      check("jobType", "Job type is required").isIn([
        "Full-time",
        "Part-time",
        "Contract",
        "Internship",
        "Remote",
      ]),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        description,
        company,
        location,
        salary,
        jobType,
        requirements,
        skills,
        status,
      } = req.body;

      const newJob = new Job({
        title,
        description,
        company,
        location,
        salary,
        jobType,
        requirements,
        skills,
        status: status || "open",
        createdBy: req.user.id,
      });

      const job = await newJob.save();
      res.json(job);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/jobs
// @desc    Get all jobs
// @access  Public
router.get("/", async (req, res) => {
  try {
    // Add filters
    const { location, jobType, search, status } = req.query;
    const queryObject = {};

    // Filter by status if provided
    if (status && status !== "all") {
      queryObject.status = status;
    } else {
      // By default, show only open jobs
      queryObject.status = "open";
    }

    // Filter by location if provided
    if (location && location !== "all") {
      queryObject.location = { $regex: location, $options: "i" };
    }

    // Filter by job type if provided
    if (jobType && jobType !== "all") {
      queryObject.jobType = jobType;
    }

    // Search in title, company, or description
    if (search) {
      queryObject.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(queryObject)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name company");

    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "createdBy",
      "name company"
    );

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   PUT api/jobs/:id
// @desc    Update job
// @access  Private (only the job creator or admin)
router.put("/:id", auth, async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // Check user is job creator or admin
    if (job.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ msg: "User not authorized" });
    }

    const {
      title,
      description,
      company,
      location,
      salary,
      jobType,
      requirements,
      skills,
      status,
    } = req.body;

    // Build job object
    const jobFields = {};
    if (title) jobFields.title = title;
    if (description) jobFields.description = description;
    if (company) jobFields.company = company;
    if (location) jobFields.location = location;
    if (salary) jobFields.salary = salary;
    if (jobType) jobFields.jobType = jobType;
    if (requirements) jobFields.requirements = requirements;
    if (skills) jobFields.skills = skills;
    if (status) jobFields.status = status;

    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: jobFields },
      { new: true }
    );

    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   DELETE api/jobs/:id
// @desc    Delete a job
// @access  Private (only the job creator or admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // Check user is job creator or admin
    if (job.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await job.deleteOne();

    res.json({ msg: "Job removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   GET api/jobs/recruiter/myjobs
// @desc    Get all jobs posted by the logged in recruiter
// @access  Private (recruiters and admins)
router.get(
  "/recruiter/myjobs",
  auth,
  checkRole(["recruiter", "admin"]),
  async (req, res) => {
    try {
      const jobs = await Job.find({ createdBy: req.user.id }).sort({
        createdAt: -1,
      });
      res.json(jobs);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/jobs/stats
// @desc    Get job statistics
// @access  Private (admin only)
router.get("/admin/stats", [auth, checkRole(["admin"])], async (req, res) => {
  try {
    // Total jobs count
    const totalJobs = await Job.countDocuments();

    // Count by status
    const openJobs = await Job.countDocuments({ status: "open" });
    const closedJobs = await Job.countDocuments({ status: "closed" });

    // Count by job type
    const fullTimeJobs = await Job.countDocuments({ jobType: "Full-time" });
    const partTimeJobs = await Job.countDocuments({ jobType: "Part-time" });
    const contractJobs = await Job.countDocuments({ jobType: "Contract" });
    const internshipJobs = await Job.countDocuments({ jobType: "Internship" });
    const remoteJobs = await Job.countDocuments({ jobType: "Remote" });

    // Recent jobs
    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalJobs,
      byStatus: { open: openJobs, closed: closedJobs },
      byJobType: {
        fullTime: fullTimeJobs,
        partTime: partTimeJobs,
        contract: contractJobs,
        internship: internshipJobs,
        remote: remoteJobs,
      },
      recentJobs,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
