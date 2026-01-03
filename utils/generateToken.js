const jwt = require('jsonwebtoken');

const generateToken = (id, isAdmin) => {
  return jwt.sign(
    { id, isAdmin }, // Include isAdmin in the payload
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
