const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");

// @route   POST api/applications
// @desc    Apply for a job
// @access  Private (users only)
router.post(
  "/",
  [
    auth,
    [
      check("job", "Job ID is required").not().isEmpty(),
      check("coverLetter", "Cover letter is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if job exists
      const job = await Job.findById(req.body.job);
      if (!job) {
        return res.status(404).json({ msg: "Job not found" });
      }

      // Check if job is open
      if (job.status !== "open") {
        return res
          .status(400)
          .json({ msg: "This job is no longer accepting applications" });
      }

      // Check if user already applied to this job
      const existingApplication = await Application.findOne({
        job: req.body.job,
        applicant: req.user.id,
      });

      if (existingApplication) {
        return res
          .status(400)
          .json({ msg: "You have already applied for this job" });
      }

      const { coverLetter, resume } = req.body;

      // Create new application
      const newApplication = new Application({
        job: req.body.job,
        applicant: req.user.id,
        coverLetter,
        resume,
      });

      const application = await newApplication.save();

      // Populate with applicant and job details for the response
      const populatedApplication = await Application.findById(application._id)
        .populate("applicant", "name email")
        .populate("job", "title company");

      res.json(populatedApplication);
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Job not found" });
      }
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/applications/me
// @desc    Get all applications by current user
// @access  Private (users only)
router.get("/me", auth, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .sort({ createdAt: -1 })
      .populate("job", "title company location status");

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/applications/job/:job_id
// @desc    Get all applications for a specific job
// @access  Private (job creator or admin only)
router.get("/job/:job_id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.job_id);

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // Check if user is job creator or admin
    if (job.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ msg: "Not authorized" });
    }

    const applications = await Application.find({ job: req.params.job_id })
      .sort({ createdAt: -1 })
      .populate("applicant", "name email skills");

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   PUT api/applications/:id
// @desc    Update application status (shortlist, reject, interview, hire)
// @access  Private (recruiters and admins only)
router.put(
  "/:id",
  [
    auth,
    [
      check("status", "Status is required").isIn([
        "pending",
        "shortlisted",
        "rejected",
        "interviewed",
        "hired",
      ]),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let application = await Application.findById(req.params.id).populate(
        "job"
      );

      if (!application) {
        return res.status(404).json({ msg: "Application not found" });
      }

      // Check if user is authorized (job creator or admin)
      if (
        application.job.createdBy.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(401).json({ msg: "Not authorized" });
      }

      // Update status
      application.status = req.body.status;
      application.feedback = req.body.feedback || "";

      // If hired, close the job
      if (req.body.status === "hired") {
        await Job.findByIdAndUpdate(application.job._id, { status: "closed" });
      }

      await application.save();

      res.json(application);
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Application not found" });
      }
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/applications/stats
// @desc    Get application statistics
// @access  Private (admin only)
router.get(
  "/admin/stats",
  [auth, require("../middleware/checkRole")(["admin"])],
  async (req, res) => {
    try {
      // Total applications count
      const totalApplications = await Application.countDocuments();

      // Count by status
      const pendingApplications = await Application.countDocuments({
        status: "pending",
      });
      const shortlistedApplications = await Application.countDocuments({
        status: "shortlisted",
      });
      const rejectedApplications = await Application.countDocuments({
        status: "rejected",
      });
      const interviewedApplications = await Application.countDocuments({
        status: "interviewed",
      });
      const hiredApplications = await Application.countDocuments({
        status: "hired",
      });

      // Recent applications
      const recentApplications = await Application.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("applicant", "name")
        .populate("job", "title company");

      res.json({
        totalApplications,
        byStatus: {
          pending: pendingApplications,
          shortlisted: shortlistedApplications,
          rejected: rejectedApplications,
          interviewed: interviewedApplications,
          hired: hiredApplications,
        },
        recentApplications,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
