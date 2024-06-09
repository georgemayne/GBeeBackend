const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const verifiedToken = jwt.verify(token, process.env.GB_SEC);
        const user = await User.findOne({_id: verifiedToken.id});

        if (!user)
            throw new Error();

        req.user = user;
        next();
    } catch (err) {
        res.status(401).send({error: 'Authentication Failed. Please login again.'});
    }
}

module.exports = auth;
