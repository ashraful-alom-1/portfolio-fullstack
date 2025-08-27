require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ 
    message: "Backend is working!",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for monitoring
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
  });
});

// Connect to database
connectDB();

// Use routes
app.use("/api/messages", messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});