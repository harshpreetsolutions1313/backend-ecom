const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Order = require('../models/Order');

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) {
      data.id = `prod_${Date.now()}`;
    }
    const product = new Product(data);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {

    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );

    res.json(product)

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

// Delete a product
exports.deleteProduct = async (req, res) => {

  try {
    await Product.deleteOne({ id: req.params.id });

    res.status(204).send();

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

// List all product categories
exports.listCategories = async (req, res) => {
  
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

// List all product categories with image and count
// i can proovide the response of get products so that you can extract the categories with image and count
// exports.listCategoriesWithDetails = async (req, res) => {
//   try {
//     const products = await Product.find({});
//     const categoryMap = {};
//     products.forEach(product => {
//       if (!categoryMap[product.category]) {
//         categoryMap[product.category] = {
//           category: product.category,
//           imageUrl: product.images[0] || null,
//           count: 0
//         };
//       }
//       categoryMap[product.category].count += 1;
//     });
//     const categories = Object.values(categoryMap);
//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   } 
// };




exports.searchProducts = async (req, res) => {
  try {
    console.log("Inside searchProducts controller");

    const query = req.query.q;

    console.log("Search query:", query);

    if (!query) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    //case insensitive search in name field
    const products = await Product.find({

      // mongo db query operator for or condition

      $or : [
        {name : { $regex: query, $options: 'i'}}    
      ]
    })

    res.json(products);

  }catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error during search" } );
  }

};

// API to get products by category
// exports.getProductsByCategory = async (req, res) => {
//   try {

//     console.log("parameters received:", req.params);
//     const category = req.params.categoryName;

//     console.log("Searching for category:", category); 

//     console.log("Fetching products for category:", category);

//     const products = await Product.find({ category: category});

//     console.log(`Found ${products.length} products in category ${category}`);

//     res.json(products);

//   } catch (error){

//     res.status(500).json({error: error.message});
    
//   }
// }

exports.getProductsByCategory = async (req, res) => {
  try {
    console.log("inside a category");
    const category = req.params.categoryName;
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 products per page if not provided

    const skip = (page - 1) * limit; // Calculate the number of products to skip

    console.log(`Fetching products for category: ${category}, page: ${page}, limit: ${limit}`);

    // Fetch products with pagination
    const products = await Product.find({ category: category })
      .skip(skip)
      .limit(limit);

    // Get the total number of products in the category for pagination metadata
    const totalProducts = await Product.countDocuments({ category: category });

    console.log(`Found ${products.length} products in category ${category} for page ${page}`);

    // Send the paginated products along with pagination metadata
    res.json({
      products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        productsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Admin API to create a category - each category should have category id, name, imageUrl

// exports.createCategory = async (req, res) => {

//   try {

//     const { name, imageUrl } = req.body;

//     const category = new Category({ name, imageUrl });

//     await category.save();

//     res.status(201).json(category);

//   } catch (error) {

//     res.status(500).json({ error: error.message });

//   }

// };

// filter products by pricerange
exports.filterProductsByPriceRange = async (req, res) => {
  
  try {

    console.log("Inside filterProductsByPriceRange controller");

    console.log("filtering the product", req.query);

    const { minPrice, maxPrice } = req.query;

    const products = await Product.find({
      price: { $gte: Number(minPrice), $lte: Number(maxPrice) }
    });

    res.json(products);

  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Wishlist APIs

//Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res.status(200).json({ message: 'Product added to wishlist' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {

  try {

    const productId = req.params.id;

    const userId = req.user.id;

    const user = await User.findById(userId);

    user.wishlist = user.wishlist.filter(id => id !== productId);

    await user.save();

    res.status(200).json({ message: 'Product removed from wishlist' });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};

//get product by product ID
exports.getProductById = async (productId) => {
  try {
    const product = await Product.findOne({ id: productId });
    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};

//Get user's wishlist
exports.getWishlist = async (req, res) => {

  console.log("Inside getWishlist controller");
  
  try {
    const userId = req.user.id;
    console.log("Fetching wishlist for user:", userId);

    const user = await User.findById(userId).populate('wishlist');
    console.log("User's wishlist:", user.wishlist);

    // Populate wishlist with product details
    const populatedWishlist = await Promise.all(
      user.wishlist.map(async (productId) => {
        const product = await exports.getProductById(productId);
        return product;
      })
    );
    // populatedWishlist
    console.log("Populated wishlist:", populatedWishlist);

    res.status(200).json(populatedWishlist);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBestSellingProducts = async (req, res) => {
  try {
    // 1. Get all paid orders
    const paidOrders = await Order.find({ paid: true });
    // console.log("Paid Orders:", paidOrders);

    // 2. Aggregate to get total quantity sold per product
    const bestSellingProducts = await Order.aggregate([
      { $match: { paid: true } },
      { $group: {
          _id: "$productId",
          totalQuantity: { $sum: "$quantity" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 4 }
    ]);
    // console.log("Aggregated Products:", bestSellingProducts);

    // 3. Populate product names
    const populatedProducts = await Promise.all(
      bestSellingProducts.map(async (item) => {
        const product = await Product.findOne({ id: item._id });
        console.log("Product for ID", item._id, ":", product);
        return {
          productId: item._id,
          name: product?.name || "Unknown",
          quantity: item.totalQuantity
        };
      })
    );
    // console.log("Populated Products:", populatedProducts);

    res.json({
      success: true,
      data: {
        bestSellingProducts: populatedProducts
      }
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Filter products (price: low to high / high to low)
exports.filterProducts = async (req, res) => {
  try {
    const { sort } = req.query;

    let sortQuery = {};

    // Price sorting
    if (sort === 'price_asc') {
      sortQuery.price = 1; // Low → High
    } else if (sort === 'price_desc') {
      sortQuery.price = -1; // High → Low
    }

    const products = await Product.find({}).sort(sortQuery);

    res.status(200).json(products);
  } catch (error) {
    console.error('Error filtering products:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.searchProductsByCategory = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 10 } = req.query;

    if (!category) {
      return res.status(400).json({ message: 'category is required' });
    }

    const searchFilter = {
      category: category
    };

    // If search keyword exists, add name search
    if (q) {
      searchFilter.name = { $regex: q, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(searchFilter)
      .skip(skip)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(searchFilter);

    res.status(200).json({
      products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: Number(page),
        productsPerPage: Number(limit)
      }
    });

  } catch (error) {
    console.error('Error searching products by category:', error);
    res.status(500).json({ error: error.message });
  }
};
