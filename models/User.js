const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// user schema definition
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    wishlist: [{ type: String }], // Array of product IDs
    cart: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1, default: 1 }
        }
    ]
});

// pre-save hook to hash password
userSchema.pre('save', async function () {

    if (!this.isModified('password')) {
        return; 
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
});

// method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);