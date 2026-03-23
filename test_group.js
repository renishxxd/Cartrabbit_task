import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './backend/models/Conversation.js';
import User from './backend/models/User.js';

dotenv.config({ path: './backend/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected");
  
  const users = await User.find({}).limit(5);
  console.log("Users available:", users.map(u => u.username));
  
  if (users.length < 3) {
    console.log("Not enough users to test multiple member groups");
    process.exit(0);
  }

  const admin = users[0];
  const p1 = users[1];
  const p2 = users[2];

  // Try creating a group with p1 and p2
  try {
    const conv1 = await Conversation.create({
      isGroup: true,
      groupName: "Test Group 1",
      groupAdmin: admin._id,
      participants: [admin._id, p1._id, p2._id]
    });
    console.log("Successfully created group 1:", conv1._id);

    const conv2 = await Conversation.create({
      isGroup: true,
      groupName: "Test Group 2",
      groupAdmin: admin._id,
      participants: [admin._id, p1._id]
    });
    console.log("Successfully created group 2:", conv2._id);
  } catch (e) {
    console.error("Error creating group:", e);
  }

  process.exit(0);
}

run();
