const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const User = require('../models/user');
const Message = require('../models/message');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const { json } = require('body-parser');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const message = await Message.get(req.params);
        if (message.from_user.username != req.user || message.to_user.username != req.user) {
            throw new ExpressError('Logged in user must be the sender or the recipeint to view.', 400);
        } else {
            return res.json(message);
        }
    } catch (e) {
        return next(e);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const { to_username, body } = req.body
        const message = await Message.create(req.user, to_username, body);
        return res.json(message)
    } catch (e) {
        return next(e);
    }
})
/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try {
        const message = await Message.get(req.params);
        if (message.to_user.username != req.user) {
            throw new ExpressError('Only the intended recipient can mark as read', 400);

        } else {
            const readMessage = await Message.markRead(req.params);
            return res.json(readMessage);
        }
    } catch (e) {
        return next(e);
    }
})

module.exports = router;