import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './models/Conversation.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB!");
  
  const adminId = new mongoose.Types.ObjectId();
  const user1 = new mongoose.Types.ObjectId();
  const user2 = new mongoose.Types.ObjectId();

  try {
    const c1 = await Conversation.create({
      isGroup: true,
      groupName: "Alpha",
      groupAdmin: adminId,
      participants: [adminId, user1]
    });
    console.log("C1 created:", c1._id);

    const c2 = await Conversation.create({
      isGroup: true,
      groupName: "Beta",
      groupAdmin: adminId,
      participants: [adminId, user1, user2]
    });
    console.log("C2 created:", c2._id);
    
    // Test getConversations mock
    const conversations = await Conversation.find({
      participants: adminId
    }).sort({ updatedAt: -1 });
    
    console.log("Found conversations:", conversations.length);
    console.log(conversations.map(c => c.groupName));

  } catch(e) {
    console.error("DB Error:", e);
  }

  process.exit(0);
}

run();
