const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust the path to your User model
require('dotenv').config(); // Load environment variables

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return promoteToAdmin();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Function to promote a user to admin
const promoteToAdmin = async () => {
  try {
    const userId = '69552684fc708ead3e2e87b8'; // Replace with the user's ID
    const user = await User.findById(userId);

    if (!user) {
      console.log(`User with ID ${userId} not found.`);
      return;
    }

    user.isAdmin = true;
    await user.save();
    console.log(`User ${user.name} (${user.email}) is now an admin.`);
  } catch (error) {
    console.error('Error promoting user to admin:', error);
  } finally {
    mongoose.connection.close();
  }
};
