const express = require('express');
const router = express.Router();
const { addProduct, getProducts, getProduct, updateProduct, deleteProduct, listCategories, listCategoriesWithDetails, searchProducts, getProductsByCategory, createCategory } = require('../controllers/product');
const { filterProductsByPriceRange, addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/product');
const { restrict } = require('../middleware/auth');

router.post('/', addProduct);
router.get('/', getProducts);
// Put specific routes (search/categories) before the dynamic `/:id` route
router.get('/wishlist', restrict, getWishlist);
router.get('/search', searchProducts);
router.get('/categories/list', listCategories);
// router.get('/categories', listCategoriesWithDetails);
router.get('/categories/details', listCategoriesWithDetails);
router.get('/category/:categoryName', getProductsByCategory);

// create category
router.post('/category/create', createCategory);
//filter products by price range    
router.get('/filter/price-range', filterProductsByPriceRange);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
// Wishlist routes
router.post('/wishlist/add/:id', restrict, addToWishlist);
router.post('/wishlist/remove/:id', restrict, removeFromWishlist);


module.exports = router;

