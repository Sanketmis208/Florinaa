const express = require("express");
const router = express.Router();
const {
  createLead,
  getLeads,
  updateLeadStatus,
  exportLeadsCsv,
} = require("../controllers/leadController");
const { protect } = require("../middleware/auth");

router.post("/", createLead);
router.get("/admin", protect, getLeads);
router.put("/admin/:id", protect, updateLeadStatus);
router.get("/admin/export", protect, exportLeadsCsv);

module.exports = router;
