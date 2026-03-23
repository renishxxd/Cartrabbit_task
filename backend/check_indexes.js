import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const db = mongoose.connection.db;
    const indexes = await db.collection('conversations').indexes();
    console.log("INDEXES:", JSON.stringify(indexes, null, 2));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
});
