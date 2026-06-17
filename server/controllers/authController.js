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
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
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
