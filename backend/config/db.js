import mongoose from 'mongoose';
import dns from 'dns';
import { seedDatabase } from './dbSeeder.js';

const connectDB = async () => {
  try {
    // Configure public DNS servers fallback for Windows SRV queries
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (dnsErr) {
      console.warn('Custom DNS setServers failed, falling back to system default:', dnsErr.message);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
    
    // Seed database with initial structure if empty
    await seedDatabase();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
