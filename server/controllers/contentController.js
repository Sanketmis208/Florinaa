const Content = require("../models/Content");

// @desc    Get website content settings (public)
// @route   GET /api/content
// @access  Public
const getContent = async (req, res) => {
  try {
    let content = await Content.findOne({});

    // Seed default content if none exists
    if (!content) {
      content = new Content({
        heroTitle: "Where Comfort Meets Elegance",
        heroSubtitle: "Premium bedding, blankets, sheets, and soft-floor textiles crafted by Maulifab Pvt. Limited for homes that value quiet luxury.",
        heroImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=90",
        catalogueUrl: "/catalogue-placeholder.pdf",
        aboutText: "Florinaa - Sleep in Style brings Maulifab's textile manufacturing discipline into a warmer, more design-led home lifestyle brand. From Panipat to premium homes, every piece is designed around softness, durability, and dependable finishing.",
        facilityImages: [
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85",
          "https://images.unsplash.com/photo-1581093458791-9d15482442f6?auto=format&fit=crop&w=1200&q=85",
          "https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=1200&q=85",
        ],
      });
      await content.save();
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update website content settings (admin)
// @route   PUT /api/admin/content
// @access  Private
const updateContent = async (req, res) => {
  const { heroTitle, heroSubtitle, heroImage, catalogueUrl, aboutText, facilityImages } = req.body;

  try {
    let content = await Content.findOne({});

    if (!content) {
      content = new Content();
    }

    if (heroTitle !== undefined) content.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) content.heroSubtitle = heroSubtitle;
    if (heroImage !== undefined) content.heroImage = heroImage;
    if (catalogueUrl !== undefined) content.catalogueUrl = catalogueUrl;
    if (aboutText !== undefined) content.aboutText = aboutText;
    if (facilityImages !== undefined) content.facilityImages = facilityImages;

    const updatedContent = await content.save();
    res.json(updatedContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getContent,
  updateContent,
};
