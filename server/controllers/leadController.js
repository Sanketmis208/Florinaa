const Lead = require("../models/Lead");

const notify = (event, payload) => {
  if (!process.env.EMAIL_WEBHOOK_URL) return;
  fetch(process.env.EMAIL_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      payload,
      to: process.env.ADMIN_NOTIFICATION_EMAIL || "",
    }),
  }).catch(() => {});
};

// @desc    Submit a new lead (public)
// @route   POST /api/leads
// @access  Public
const createLead = async (req, res) => {
  const { name, companyName, email, phone, requirement, type } = req.body;

  try {
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Name, email, and phone are required" });
    }

    const leadType = type === "catalogue-download" ? "catalogue-download" : "inquiry";

    const lead = new Lead({
      name,
      companyName,
      email,
      phone,
      requirement,
      type: leadType,
      status: "new",
    });

    const createdLead = await lead.save();

    // Trigger webhook notification
    notify(
      leadType === "catalogue-download" ? "florinaa.catalogue.lead.created" : "florinaa.inquiry.created",
      createdLead
    );

    res.status(201).json({
      ok: true,
      lead: createdLead,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all leads (admin)
// @route   GET /api/admin/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update lead status (admin)
// @route   PUT /api/admin/leads/:id
// @access  Private
const updateLeadStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    if (status) {
      lead.status = status;
    }

    const updatedLead = await lead.save();
    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Export leads to CSV (admin)
// @route   GET /api/admin/export-csv
// @access  Private
const exportLeadsCsv = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });

    const rows = [
      ["id", "type", "createdAt", "name", "companyName", "phone", "email", "requirement", "status"]
    ];

    leads.forEach((item) => {
      rows.push([
        item._id.toString(),
        item.type || "inquiry",
        item.createdAt.toISOString(),
        item.name || "",
        item.companyName || "",
        item.phone || "",
        item.email || "",
        item.requirement || "",
        item.status || "new",
      ]);
    });

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=florinaa-leads.csv");
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createLead,
  getLeads,
  updateLeadStatus,
  exportLeadsCsv,
};
