const express = require('express');
const router = express.Router();

const {
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  listCategoriesWithDetails
} = require('../controllers/category');

router.get('/details', listCategoriesWithDetails);
router.post('/create', createCategory);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);



module.exports = router;