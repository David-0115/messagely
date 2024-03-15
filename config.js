/** Common config for message.ly */

// read .env files and make environmental variables

require('dotenv').config();

const DB_NAME = (process.env.NODE_ENV === "test")
  ? "messagely_test"
  : "messagely";

const SECRET_KEY = process.env.SECRET_KEY;

const BCRYPT_WORK_FACTOR = (process.env.NODE_ENV === "test")
  ? 1
  : 12;

const BCRYPT_SALT_ROUNDS = (process.env.NODE_ENV === "test")
  ? 1
  : 10;

module.exports = {
  DB_NAME,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
  BCRYPT_SALT_ROUNDS
};