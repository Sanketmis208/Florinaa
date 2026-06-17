const Category = require("../models/Category");
const Product = require("../models/Product");

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/admin/categories
// @access  Private
const createCategory = async (req, res) => {
  const { name, order } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Please provide category name" });
    }

    const slug = slugify(name);
    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      return res.status(400).json({ error: "Category already exists" });
    }

    // Auto-calculate order if not provided
    let categoryOrder = order;
    if (categoryOrder === undefined || categoryOrder === null) {
      const count = await Category.countDocuments();
      categoryOrder = count + 1;
    }

    const category = new Category({
      name,
      slug,
      order: categoryOrder,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/admin/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  const { name, order } = req.body;

  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (name) {
      category.name = name;
      category.slug = slugify(name);
    }
    if (order !== undefined) category.order = order;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if category is used in products
    const productsUsingCategory = await Product.countDocuments({ category: req.params.id });
    if (productsUsingCategory > 0) {
      return res.status(400).json({
        error: `Cannot delete category: it is used by ${productsUsingCategory} product(s). Reassign them first.`,
      });
    }

    await Category.deleteOne({ _id: req.params.id });
    res.json({ message: "Category removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
