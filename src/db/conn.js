const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

let cached = globalThis.__mongooseCache;
if (!cached) {
    cached = globalThis.__mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;

    const DB = process.env.DATABASE;
    if (!DB) {
        throw new Error("DATABASE environment variable is not set.");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(DB, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        // Don't cache a failure - let the next request try again.
        cached.promise = null;
        throw err;
    }

    return cached.conn;
}

module.exports = connectDB;
