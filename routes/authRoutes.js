const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body
        const isAuth = await User.authenticate(username, password);
        if (isAuth) {
            await User.updateLoginTimestamp();
            const token = jwt.sign(username, SECRET_KEY);
            return res.json({ "_token": token });
        } else {
            throw new ExpressError(`Unauthorized`, 401);
        }
    } catch (e) {
        return next(e);
    }


})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try {
        const register = await User.register(req.body);

        if (!register.username) {
            throw new ExpressError(`Registration failed, please check info and try again`, 400);
        } else {
            const user = { "username": register.username }
            const token = jwt.sign(user, SECRET_KEY);

            return res.json({ "_token": token })
        }
    } catch (e) {
        return next(e);
    }
})

module.exports = router;