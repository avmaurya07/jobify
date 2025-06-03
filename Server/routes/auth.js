const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    check("role")
      .isIn(["user", "recruiter", "admin"])
      .withMessage("Role must be user, recruiter, or admin"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      user = new User({
        name,
        email,
        password,
        role: role || "user",
      });

      // Password is encrypted via the User model pre-save hook

      await user.save();

      const token = user.getSignedJwtToken();

      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check for user
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      const token = user.getSignedJwtToken();

      // Return token and user data (excluding password)
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      res.json({ token, user: userData });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT api/auth/update
// @desc    Update user profile
// @access  Private
router.put("/update", auth, async (req, res) => {
  try {
    const {
      name,
      resume,
      skills,
      company,
      position,
      currentPassword,
      newPassword,
    } = req.body;

    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (resume !== undefined) userFields.resume = resume;
    if (skills) userFields.skills = skills;
    if (company !== undefined) userFields.company = company;
    if (position !== undefined) userFields.position = position;

    // If password change requested
    if (currentPassword && newPassword) {
      // Check current password
      const user = await User.findById(req.user.id).select("+password");

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ msg: "Current password is incorrect" });
      }

      // Update password (will be hashed via middleware in User model)
      userFields.password = newPassword;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
