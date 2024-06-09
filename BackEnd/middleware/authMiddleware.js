const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const verifiedToken = jwt.verify(token, process.env.JWT_EXPIRE);

        const user = await User.findOne({id: verifiedToken.id});

        if (!user)
            throw new Error();

        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({error: 'Authentication Failed. Please login again.'});
    }
}

module.exports = auth;
