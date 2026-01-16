const express = require('express');
const router = express.Router();
const { addProduct, getProducts, getProduct, updateProduct, deleteProduct, listCategories, listCategoriesWithDetails, searchProducts, getProductsByCategory } = require('../controllers/product');
const { filterProductsByPriceRange, addToWishlist, removeFromWishlist, getWishlist, getBestSellingProducts, filterProducts } = require('../controllers/product');
const { restrict } = require('../middleware/auth');
const {
    getCategoryStats
} = require('../controllers/category-stats');

router.post('/', addProduct);
router.get('/', getProducts);
router.get('/category-stats', getCategoryStats);
// Put specific routes (search/categories) before the dynamic `/:id` route
router.get('/wishlist', restrict, getWishlist);
router.get('/search', searchProducts);
router.get('/categories/list', listCategories);
router.get('/category/:categoryName', getProductsByCategory);

// create category
// router.post('/category/create', createCategory);
//filter products by price range    
router.get('/filter/price-range', filterProductsByPriceRange);

router.get('/best-selling', getBestSellingProducts);
router.get('/filter', filterProducts);

router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
// Wishlist routes
router.post('/wishlist/add/:id', restrict, addToWishlist);
router.post('/wishlist/remove/:id', restrict, removeFromWishlist);


module.exports = router;

