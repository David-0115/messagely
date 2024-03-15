/** User class for message.ly */
const db = require('../db');
const bcrypt = require('bcrypt')
const { BCRYPT_WORK_FACTOR, SECRET_KEY, BCRYPT_SALT_ROUNDS } = ('../config.js')
const ExpressError = require("../expressError");



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS)
    const hashedPw = await bcrypt.hash(password, salt);
    const result = await db.query(`
        INSERT INTO users (username, password, first_name, last_name, phone, join_at,last_login_at)
        VALUES ($1,$2,$3,$4,$5,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING username,password,first_name,last_name,phone`,
      [username, hashedPw, first_name, last_name, phone])
    return result.rows[0]
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(`SELECT username, password FROM users WHERE username = $1`, [username]);
    const user = result.rows[0];

    const isAuth = await bcrypt.compare(password, user.password)
    if (!isAuth) {
      throw new ExpressError('Incorrect username / password', 400)
    }
    return isAuth;

  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(`UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE username = $1 RETURNING username`, [username]);
    if (!result.rows[0]) {
      throw new ExpressError(`${username} invalid`, 400);
    }

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(`SELECT username, first_name, last_name, phone FROM users`);
    return result.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(`
    SELECT username, first_name, last_name, phone, join_at, last_login_at
     FROM users WHERE username = $1`, [username]);
    if (!result.rows[0]) {
      throw new ExpressError(`${username} invalid`, 400)
    } else {
      return result.rows[0]
    }

  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const userCheck = await User.get(username);  //throws error if username is invalid
    const result = await db.query(`
      SELECT id, to_username AS to_user, body, sent_at, read_at
        FROM messages WHERE from_username = $1`,
      [username]);
    for (let row of result.rows) {
      const userResult = await db.query(`SELECT username, first_name, last_name, phone FROM users WHERE username = $1`, [row.to_user]);
      row.to_user = userResult.rows[0]
    }
    return result.rows
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const userCheck = await User.get(username);
    const result = await db.query(`
      SELECT id, from_username AS from_user, body, sent_at, read_at
        FROM messages WHERE to_username = $1`,
      [username]);
    for (let row of result.rows) {
      const userResult = await db.query(`SELECT username, first_name, last_name, phone FROM users WHERE username = $1`, [row.from_user])
      row.from_user = userResult.rows[0]
    }
    return result.rows;
  }
}


module.exports = User;


/* Database user columns
 username | password | first_name | last_name | phone | join_at | last_login_at

    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone NOT NULL,
    last_login_at timestamp with time zone
    
 */

/* Database message table columns

 id | from_username | to_username | body | sent_at | read_at

    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users,
    to_username text NOT NULL REFERENCES users,
    body text NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    read_at timestamp with time zone

 */
