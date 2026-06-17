const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      default: "Where Comfort Meets Elegance",
    },
    heroSubtitle: {
      type: String,
      default: "Premium bedding and soft-floor textiles crafted for homes that value quiet luxury.",
    },
    heroImage: {
      type: String,
      default: "",
    },
    catalogueUrl: {
      type: String,
      default: "",
    },
    aboutText: {
      type: String,
      default: "",
    },
    facilityImages: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Content", contentSchema);
