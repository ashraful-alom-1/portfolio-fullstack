const mongoose = require("mongoose");

async function connectDB() {
  try {
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    
    console.log("✅ MongoDB connected:", conn.connection.host);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    
    // Provide specific error messages
    if (err.name === 'MongoNetworkError') {
      console.log("💡 Solution: Check your IP whitelist in MongoDB Atlas");
    } else if (err.name === 'MongoServerError' && err.code === 8000) {
      console.log("💡 Solution: Check your username/password in MongoDB Atlas");
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;