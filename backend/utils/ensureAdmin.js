const User = require("../models/User");

// Keep the admin login in MongoDB in step with ADMIN_EMAIL / ADMIN_PASSWORD,
// so changing those env vars (e.g. on Render) is all it takes to change the login.
const ensureAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set; skipping admin user sync.");
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      await User.create({ email, password, role: "admin" });
      console.log(`Admin user created for ${email}.`);
      return;
    }

    if (!(await user.matchPassword(password))) {
      user.password = password; // re-hashed by the User pre-save hook
      await user.save();
      console.log(`Admin password updated for ${email}.`);
    }
  } catch (error) {
    console.error(`Admin user sync failed: ${error.message}`);
  }
};

module.exports = ensureAdmin;
