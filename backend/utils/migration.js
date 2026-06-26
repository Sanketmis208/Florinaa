const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const Category = require("../models/Category");
const Product = require("../models/Product");
const Lead = require("../models/Lead");
const Content = require("../models/Content");
const User = require("../models/User");

const dbPath = path.join(__dirname, "..", "data", "db.json");

const runMigration = async () => {
  try {
    console.log("Starting database migration...");

    // Check if db.json exists
    if (!fs.existsSync(dbPath)) {
      console.error(`Original db.json not found at ${dbPath}. Cancelled.`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(dbPath, "utf8");
    const originalDb = JSON.parse(rawData);

    // Connect to database
    const dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/florinaa";
    console.log(`Connecting to database: ${dbUri}`);
    await mongoose.connect(dbUri);
    console.log("Database connected successfully.");

    // Clear existing collections
    console.log("Clearing existing database collections...");
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Lead.deleteMany({});
    await Content.deleteMany({});
    await User.deleteMany({});
    console.log("Database cleared.");

    // 1. Seed Default Admin User
    const adminEmail = process.env.ADMIN_EMAIL || "admin@florinaa.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin@123";
    console.log(`Seeding Admin user: ${adminEmail}`);
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
    await adminUser.save();
    console.log("Admin user seeded.");

    // 2. Seed Categories
    console.log("Seeding categories...");
    const categoryIdMap = {}; // Maps old string ID to new ObjectId
    for (const cat of originalDb.categories) {
      // Avoid duplicates from raw database
      const existing = await Category.findOne({ slug: cat.id });
      if (existing) {
        categoryIdMap[cat.id] = existing._id;
        continue;
      }
      const category = new Category({
        name: cat.name,
        slug: cat.id,
        order: cat.order,
      });
      const saved = await category.save();
      categoryIdMap[cat.id] = saved._id;
    }
    console.log(`Seeded ${Object.keys(categoryIdMap).length} categories.`);

    // 3. Seed Products
    console.log("Seeding products...");
    let productCount = 0;
    for (const prod of originalDb.products) {
      const catObjectId = categoryIdMap[prod.category];
      if (!catObjectId) {
        console.warn(`Skipping product ${prod.name}: Category ${prod.category} not found.`);
        continue;
      }

      const product = new Product({
        name: prod.name,
        slug: prod.id,
        category: catObjectId,
        gsm: prod.gsm || "N/A",
        dimensions: prod.dimensions || "N/A",
        material: prod.material || "",
        washCare: prod.washCare || [],
        images: prod.images || [],
        featured: prod.featured || false,
        visible: prod.visible !== false,
      });

      await product.save();
      productCount++;
    }
    console.log(`Seeded ${productCount} products.`);

    // 4. Seed Leads
    console.log("Seeding leads...");
    let leadCount = 0;
    if (originalDb.leads && Array.isArray(originalDb.leads)) {
      for (const leadData of originalDb.leads) {
        const lead = new Lead({
          name: leadData.name || "Anonymous",
          companyName: leadData.companyName || "",
          email: leadData.email || "no-email@example.com",
          phone: leadData.phone || "N/A",
          requirement: leadData.requirement || "",
          type: leadData.type === "catalogue-download" ? "catalogue-download" : "inquiry",
          status: leadData.status || "new",
          createdAt: leadData.createdAt ? new Date(leadData.createdAt) : new Date(),
        });
        await lead.save();
        leadCount++;
      }
    }
    console.log(`Seeded ${leadCount} leads.`);

    // 5. Seed Homepage Content
    console.log("Seeding content settings...");
    const contentData = originalDb.content || {};
    const content = new Content({
      heroTitle: contentData.heroTitle || "Where Comfort Meets Elegance",
      heroSubtitle: contentData.heroSubtitle || "Premium flannel bedding, blankets, sheets, and soft-floor textiles crafted by Florinaa for homes that value quiet luxury.",
      heroImage: contentData.heroImage || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=90",
      catalogueUrl: contentData.catalogueUrl || "/catalogue-placeholder.pdf",
      aboutText: contentData.about || "Florinaa - Sleep in Style brings textile manufacturing discipline into a lifestyle brand.",
      facilityImages: contentData.facilityImages || [],
    });
    await content.save();
    console.log("Content settings seeded.");

    console.log("Database migration completed successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Migration failed:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

runMigration();
