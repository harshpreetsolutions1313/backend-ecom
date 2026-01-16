const Category = require('../models/Category');
const Product = require('../models/Product');

exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      imageUrl,
      cat_desc,
      publish
    } = req.body

    const category = new Category({
      name,
      imageUrl,
      cat_desc,
      publish: publish !== undefined ? publish : true
    })

    await category.save()
    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}



exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Invalid category ID' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      imageUrl,
      cat_desc,
      publish
    } = req.body

    const category = await Category.findById(id)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    // Name conflict check
    if (name && name !== category.name) {
      const nameExists = await Category.findOne({ name })
      if (nameExists) {
        return res.status(409).json({ message: 'Category name already exists' })
      }
    }

    category.name = name ?? category.name
    category.imageUrl = imageUrl ?? category.imageUrl
    category.cat_desc = cat_desc ?? category.cat_desc
    category.publish = publish ?? category.publish

    await category.save()
    res.status(200).json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}



exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Invalid category ID' });
  }
};

exports.listCategoriesWithDetails = async (req, res) => {
  try {
    const categories = await Category.find().lean()

    const products = await Product.find().select('category').lean()

    const countMap = {}
    products.forEach(p => {
      countMap[p.category] = (countMap[p.category] || 0) + 1
    })

    const result = categories.map(cat => ({
      _id: cat._id,
      category: cat.name,
      imageUrl: cat.imageUrl,
      cat_desc: cat.cat_desc,
      publish: cat.publish,
      count: countMap[cat.name] || 0
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

