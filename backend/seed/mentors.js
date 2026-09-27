require('dotenv').config();
const mongoose = require('mongoose');
const Mentor = require('../models/Mentor');

const mentors = [
  {
    oldEmail: "ananya.sharma@example.com",
    name: "Ananya Sharma",
    email: "ananya.sharma@gmail.com",
    phone: "+15551234567",
    timezone: "Asia/Kolkata",
    active: true,
    maxClassesPerDay: 2,
    subjects: ["English"]
  },
  {
    oldEmail: "rahul.mehta@example.com",
    name: "Rahul Mehta",
    email: "rahul.mehta@gmail.com",
    phone: "+15551234568",
    timezone: "Asia/Kolkata",
    active: true,
    maxClassesPerDay: 2,
    subjects: ["English"]
  },
  {
    oldEmail: "michael.brown@example.com",
    name: "Michael Brown",
    email: "michael.brown@gmail.com",
    phone: "+12125550124",
    timezone: "Asia/Kolkata",
    active: true,
    maxClassesPerDay: 2,
    subjects: ["English"]
  },
  {
    oldEmail: "priya.nair@example.com",
    name: "Priya Nair",
    email: "priya.nair@gmail.com",
    phone: "+15551234569",
    timezone: "Asia/Kolkata",
    active: true,
    maxClassesPerDay: 2,
    subjects: ["Mathematics"]
  },
  {
    oldEmail: "arjun.rao@example.com",
    name: "Arjun Rao",
    email: "arjun.rao@gmail.com",
    phone: "+15551234570",
    timezone: "Asia/Kolkata",
    active: true,
    maxClassesPerDay: 2,
    subjects: ["Mathematics"]
  },
  {
    oldEmail: "neha.kapoor@example.com",
    name: "Neha Kapoor",
    email: "neha.kapoor@gmail.com",
    phone: "+15551234571",
    timezone: "Asia/Kolkata",
    active: true,
    maxClassesPerDay: 2,
    subjects: ["Science"]
  },
  {
    oldEmail: "james.wilson@example.com",
    name: "James Wilson",
    email: "james.wilson@gmail.com",
    phone: "+447700900123",
    timezone: "Asia/Kolkata",
    active: true,
    maxClassesPerDay: 2,
    subjects: ["Science"]
  },
  {
    oldEmail: "olivia.davis@example.com",
    name: "Olivia Davis",
    email: "olivia.davis@gmail.com",
    phone: "+13105550123",
    timezone: "Asia/Kolkata",
    active: true,
    maxClassesPerDay: 2,
    subjects: ["Science"]
  },
  {
    oldEmail: "emily.smith@example.com",
    name: "Emily Smith",
    email: "emily.smith@gmail.com",
    phone: "+447700900124",
    timezone: "Asia/Kolkata",
    active: true,
    maxClassesPerDay: 2,
    subjects: ["Coding"]
  },
  {
    oldEmail: "sarah.johnson@example.com",
    name: "Sarah Johnson",
    email: "sarah.johnson@gmail.com",
    phone: "+12125550123",
    timezone: "Asia/Kolkata",
    active: true,
    maxClassesPerDay: 2,
    subjects: ["Coding"]
  }
];

async function seedMentors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let created = 0;
    let updated = 0;

    for (const mentorData of mentors) {
      const { oldEmail, ...updateData } = mentorData;
      const existing = await Mentor.findOne({ email: oldEmail });
      if (existing) {
        await Mentor.findOneAndUpdate({ email: oldEmail }, updateData);
        updated++;
      } else {
        // Fallback: try to find by name
        const byName = await Mentor.findOne({ name: updateData.name });
        if (byName) {
          await Mentor.findOneAndUpdate({ name: updateData.name }, updateData);
          updated++;
        } else {
          await Mentor.create(updateData);
          created++;
        }
      }
    }

    console.log(`Seed complete: ${created} mentors created, ${updated} mentors updated`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

seedMentors();