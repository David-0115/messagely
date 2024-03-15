const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const User = require('../models/user');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const { json } = require('body-parser');


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const list = await User.all();
        return json(list);

    } catch (e) {
        return next(e);
    }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', ensureLoggedIn, async (req, res, next) => {
    try {
        const userData = User.get(req.params);
        return json(userData);
    } catch (e) {
        return next(e);
    }
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/to', ensureLoggedIn, async (req, res, next) => {
    try {
        const messages = User.messagesTo(req.params);
        return json(messages);
    } catch (e) {
        return next(e);
    }

});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureLoggedIn, async (req, res, next) => {
    try {
        const messages = User.messagesFrom(req.params);
        return json(messages);
    } catch (e) {
        return next(e);
    }
})

module.exports = router;