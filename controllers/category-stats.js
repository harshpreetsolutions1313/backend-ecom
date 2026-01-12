exports.getCategoryStats = (req, res) => {
  try {
    res.status(200).json([
      {
        category: 'dairy product',
        imageUrl: 'https://react.marketpro.wowtheme7.com/assets/images/thumbs/feature-img10.png',
        count: 1
      },
      {
        category: 'Desert',
        imageUrl: 'https://react.marketpro.wowtheme7.com/assets/images/thumbs/feature-img7.png',
        count: 2
      },
      {
        category: 'non veg',
        imageUrl: 'https://react.marketpro.wowtheme7.com/assets/images/thumbs/feature-img2.png',
        count: 1
      },
      {
        category: 'animal food',
        imageUrl: 'https://react.marketpro.wowtheme7.com/assets/images/thumbs/feature-img5.png',
        count: 1
      },
      {
        category: 'beverages',
        imageUrl: 'https://react.marketpro.wowtheme7.com/assets/images/thumbs/feature-img4.png',
        count: 1
      },
      {
        category: 'fruit',
        imageUrl: 'https://react.marketpro.wowtheme7.com/assets/images/thumbs/feature-img1.png',
        count: 1
      },
      {
        category: 'Snacks',
        imageUrl: 'https://react.marketpro.wowtheme7.com/assets/images/thumbs/feature-img9.png',
        count: 1
      },
      {
        category: 'fruits',
        imageUrl: 'https://react.marketpro.wowtheme7.com/assets/images/thumbs/feature-img6.png',
        count: 1
      },
      {
        category: 'vegetables',
        imageUrl: 'https://react.marketpro.wowtheme7.com/assets/images/thumbs/product-img1.png',
        count: 1
      }
    ])
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch category stats',
      error: error.message
    })
  }
}
