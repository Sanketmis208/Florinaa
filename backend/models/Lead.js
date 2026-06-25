const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    requirement: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["inquiry", "catalogue-download"],
      default: "inquiry",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "responded", "closed"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);
