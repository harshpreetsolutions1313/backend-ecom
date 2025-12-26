const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  console.log('Signup request body:', req.body);

  try {
    const user = await User.create({ name, email, password });
    console.log('User created:', user);

    const token = generateToken(user._id);
    
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(400).json({ message: err.message });
  }

};

const signin = async (req, res) => {

  console.log('Signin request received', req.body);

  const { email, password } = req.body;
  console.log('Signin request body:', req.body);

  try {
    const user = await User.findOne({ email });
    console.log("found user:", user);
    if (!user) throw new Error('Invalid credentials');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid credentials');
    const token = generateToken(user._id);
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { signup, signin };
