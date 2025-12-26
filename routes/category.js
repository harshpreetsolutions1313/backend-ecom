// add category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// create sub category
exports.createSubCategory = async (req, res) => {
    try {
        const { name, categoryId } = req.body;
        const subCategory = new SubCategory({ name, category: categoryId });
        await subCategory.save();
        res.status(201).json(subCategory);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
