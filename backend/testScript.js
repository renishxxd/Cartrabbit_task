import mongoose from 'mongoose';
import Otp from './models/Otp.js';
import User from './models/User.js';

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/chatapp');
    console.log('Connected to DB for testing...');
    
    const targetEmail = 'renishs.22msc@kongu.edu';
    // Clean up
    await User.deleteMany({ email: targetEmail });
    await User.deleteMany({ username: 'test_agent_user' });

    console.log('1. API Call: Post to /send-otp with', targetEmail);
    const res1 = await fetch('http://127.0.0.1:5000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test_agent_user', email: targetEmail })
    });
    const data1 = await res1.json();
    console.log('Response:', data1);
    
    if (!data1.success) throw new Error(data1.message);

    // Read OTP bypassing email
    const otpDoc = await Otp.findOne({ email: targetEmail });
    if (!otpDoc) throw new Error('OTP not found in DB');
    console.log('>> Intercepted OTP from DB:', otpDoc.otp);

    console.log('2. API Call: Post to /register with OTP');
    const res2 = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_agent_user',
        email: targetEmail,
        password: 'Password123!@',
        otp: otpDoc.otp
      })
    });
    const data2 = await res2.json();
    console.log('Response:', data2);

    if (data2.success) {
      console.log('\n✅ Full authentication flow logic is perfectly functional!');
    }

    process.exit(0);
  } catch (e) {
    console.error('\n❌ Test failed:', e);
    process.exit(1);
  }
}

test();
