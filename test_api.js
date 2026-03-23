import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './backend/models/Conversation.js';

dotenv.config({ path: './backend/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Create 3 users
  try {
    const resReg1 = await axios.post('http://localhost:5000/api/auth/register', { username: 'testuser1', email: 'test1@test.com', password: 'password123' });
    const resReg2 = await axios.post('http://localhost:5000/api/auth/register', { username: 'testuser2', email: 'test2@test.com', password: 'password123' });
    const resReg3 = await axios.post('http://localhost:5000/api/auth/register', { username: 'testuser3', email: 'test3@test.com', password: 'password123' });
  } catch(e) {} // ignore if already exist

  const loginRes = await axios.post('http://localhost:5000/api/auth/login', { email: 'test1@test.com', password: 'password123' });
  const token = loginRes.data.data.token;
  const user1_id = loginRes.data.data._id;

  const login2 = await axios.post('http://localhost:5000/api/auth/login', { email: 'test2@test.com', password: 'password123' });
  const user2_id = login2.data.data._id;
  
  const login3 = await axios.post('http://localhost:5000/api/auth/login', { email: 'test3@test.com', password: 'password123' });
  const user3_id = login3.data.data._id;

  console.log("Logged in user1, ID:", user1_id);
  
  const headers = { Authorization: `Bearer ${token}` };

  // CREATE GROUP 1
  try {
    const res1 = await axios.post('http://localhost:5000/api/groups', {
      name: 'Group Alpha',
      participants: [user2_id, user3_id]
    }, { headers });
    console.log("Group 1 Created:", res1.data.data._id);
  } catch(e) { console.error("GROUP 1 ERROR:", e.response?.data || e.message); }

  // CREATE GROUP 2
  try {
    const res2 = await axios.post('http://localhost:5000/api/groups', {
      name: 'Group Beta',
      participants: [user2_id, user3_id]
    }, { headers });
    console.log("Group 2 Created:", res2.data.data._id);
  } catch(e) { console.error("GROUP 2 ERROR:", e.response?.data || e.message); }

  // GET CONVERSATIONS
  try {
    const resConv = await axios.get('http://localhost:5000/api/messages/conversations', { headers });
    console.log("Conversations fetched length:", resConv.data.data.length);
    console.log(resConv.data.data.map(c => c.username));
  } catch(e) { console.error("GET CONV ERROR:", e.response?.data || e.message); }

  process.exit(0);
}

run();
