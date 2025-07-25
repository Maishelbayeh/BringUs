const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bringus', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    //CONSOLE.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    //CONSOLE.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB; 