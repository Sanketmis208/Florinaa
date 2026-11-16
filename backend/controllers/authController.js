const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.ADMIN_JWT_SECRET || "fallback_secret", {
    expiresIn: "12h",
  });

  res.cookie("florinaa_admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 12 * 60 * 60 * 1000,
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const safeEqual = (a, b) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

// ADMIN_EMAIL / ADMIN_PASSWORD (set on Render) always work, whatever is stored in MongoDB.
// On a match, the stored admin user is created or brought in line so the session has a user id.
const loginWithEnvCredentials = async (email, password) => {
  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!envEmail || !envPassword || email !== envEmail || !safeEqual(password, envPassword)) {
    return null;
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, password, role: "admin" });
  } else if (!(await user.matchPassword(password))) {
    user.password = password; // re-hashed by the User pre-save hook
    await user.save();
  }
  return user;
};

const login = async (req, res) => {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "").trim();

  try {
    let user = await loginWithEnvCredentials(email, password);

    if (!user) {
      const stored = await User.findOne({ email });
      if (stored && (await stored.matchPassword(password))) user = stored;
    }

    if (user) {
      generateToken(res, user._id);
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.cookie("florinaa_admin", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  if (req.user) {
    res.json({
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    });
  } else {
    res.status(404).json({ error: "User not found" });
  }
};

module.exports = { login, logout, getMe };
