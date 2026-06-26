const Product = require("../models/Product");
const Category = require("../models/Category");

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

// @desc    Get all products (public gets visible, admin gets all)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const query = {};
    // If not authenticated, only show visible ones
    if (!req.cookies.florinaa_admin) {
      query.visible = true;
    }
    const products = await Product.find(query)
      .populate("category")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      "category",
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private
const createProduct = async (req, res) => {
  const {
    name,
    category,
    gsm,
    // dimensions,
    material,
    washCare,
    images,
    featured,
    visible,
  } = req.body;

  try {
    if (!category || !gsm) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Product name is optional - auto-generate a readable default from the
    // category and GSM when the admin leaves it blank.
    let finalName = name && name.trim();
    if (!finalName) {
      const categoryDoc = await Category.findById(category);
      finalName = `${categoryDoc?.name || "Product"} - ${gsm}`.trim();
    }

    let slug = slugify(finalName);
    // Ensure slug uniqueness
    const slugExists = await Product.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const product = new Product({
      name: finalName,
      slug,
      category,
      gsm,
      material,
      washCare: Array.isArray(washCare)
        ? washCare
        : washCare
          ? washCare.split(",").map((i) => i.trim())
          : [],
      images: Array.isArray(images) ? images : [],
      featured: featured || false,
      visible: typeof visible === "boolean" ? visible : true,
    });

    const createdProduct = await product.save();
    const populated = await Product.findById(createdProduct._id).populate(
      "category",
    );
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  const {
    name,
    category,
    gsm,
    // dimensions,
    material,
    washCare,
    images,
    featured,
    visible,
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (name && name.trim()) {
      product.name = name.trim();
      product.slug = slugify(name);
    } else if (name !== undefined && !name.trim() && !product.name) {
      // Name cleared and there was nothing before - generate a fallback
      const categoryDoc = await Category.findById(category || product.category);
      product.name =
        `${categoryDoc?.name || "Product"} - ${gsm || product.gsm}`.trim();
      product.slug = slugify(product.name);
    }
    if (category) product.category = category;
    if (gsm) product.gsm = gsm;
    // if (dimensions) product.dimensions = dimensions;
    if (material !== undefined) product.material = material;
    if (washCare !== undefined) {
      product.washCare = Array.isArray(washCare)
        ? washCare
        : washCare
          ? washCare.split(",").map((i) => i.trim())
          : [];
    }
    if (images !== undefined) product.images = images;
    if (featured !== undefined) product.featured = featured;
    if (visible !== undefined) product.visible = visible;

    const updatedProduct = await product.save();
    const populated = await Product.findById(updatedProduct._id).populate(
      "category",
    );
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
