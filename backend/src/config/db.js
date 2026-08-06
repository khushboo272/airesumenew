const mongoose = require("mongoose");
const env = require("./env");

mongoose.set("strictQuery", true);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

async function connectDB() {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const conn = await mongoose.connect(env.mongoUri, {
                serverSelectionTimeoutMS: 10_000,
                family: 4,
            });
            console.log('MongoDB connected:', conn.connection.host, '/', conn.connection.name);
            break; // success — exit retry loop
        } catch (err) {
            console.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed:`, err.message);
            if (attempt < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
            } else {
                console.error("All MongoDB connection attempts exhausted. Starting server without DB.");
            }
        }
    }

    mongoose.connection.on("error", (err) => {
        console.error("MongoDB error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
    });
}

module.exports = { connectDB };