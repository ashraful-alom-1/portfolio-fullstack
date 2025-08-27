require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB Atlas connection...');
    
    // Use your exact connection string from .env
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    
    // Test if we can create a message
    const Message = require('./models/Message');
    const testMessage = new Message({
      name: 'Test User',
      email: 'test@example.com', 
      message: 'This is a test message'
    });
    
    await testMessage.save();
    console.log('✅ SUCCESS: Test message saved to database!');
    
    await mongoose.connection.close();
    console.log('✅ All tests passed! Your database is working correctly.');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    
    if (err.message.includes('password')) {
      console.log('💡 Solution: Check your MongoDB Atlas password is correct');
    } else if (err.message.includes('auth failed')) {
      console.log('💡 Solution: Verify your database user credentials in MongoDB Atlas');
    }
    
    process.exit(1);
  }
}

testConnection();