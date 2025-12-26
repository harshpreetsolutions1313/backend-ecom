const { readContract } = require('../utils/contract');

exports.withdrawToken = async (req, res) => {

  res.status(403).json({
    error: 'withdrawal error'
  });
  
};

exports.withdrawBNB = async (req, res) => {

  res.status(403).json({
    error: 'withdraw bnb error'
  });

};
