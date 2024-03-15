/** Database connection for messagely. */


const { Client } = require("pg");
const { DB_NAME } = require("./config");
if (process.env.NODE_ENV === "test") {
    require('dotenv').config({ path: '../.env' });
} else {
    require('dotenv').config();
}







const client = new Client({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: DB_NAME
});

client.connect();

module.exports = client;
