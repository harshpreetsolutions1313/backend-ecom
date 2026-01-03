const admin = (req, res, next) => {

    console.log('I am req user', req.user);
    console.log('Admin middleware invoked', req.user.isAdmin);

    if (!req.user || !req.user.isAdmin) {

        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });

    }

    next();
};

module.exports = { admin };