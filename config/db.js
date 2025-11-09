import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  try {
    // Use GitHub Actions secret if available, otherwise fallback to local .env
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;

    const conn = await mongoose.connect(mongoUri);
    console.log(`Connected To MongoDB Database ${conn.connection.host}`.bgMagenta.white);
  } catch (error) {
    console.log(`Error in MongoDB: ${error}`.bgRed.white);
    process.exit(1); // Exit process if connection fails
  }
};

export default connectDB;
