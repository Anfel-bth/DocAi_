// src/db/db.js
// A single shared database connection, used by every service.
import Database from "better-sqlite3";

const db = new Database("./app.sqlite");

export default db;
