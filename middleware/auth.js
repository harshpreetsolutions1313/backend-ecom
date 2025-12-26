const jwt = require('jsonwebtoken');

const restrict = (req, res, next) => {

  // Get the token from the header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // console.log('Auth Token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoded Token:', decoded);

    // Attached user info to request object
    req.user = decoded; // Add user info to the request object
    next(); // Proceed to the next middleware/route handler
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = { restrict };
