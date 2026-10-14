require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Video = require('./models/Video');
const Enrollment = require('./models/Enrollment');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tutorial-dev');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Video.deleteMany({});
    await Enrollment.deleteMany({});
    console.log('Cleared existing collections.');

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      is_paid: true,
      paid_at: new Date(),
    });
    console.log('Created Admin:', admin.email);

    // Create Student
    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await User.create({
      name: 'John Student',
      email: 'student@example.com',
      password: studentPassword,
      role: 'student',
      is_paid: true,
      paid_at: new Date(),
    });
    console.log('Created Student:', student.email);

    // Create Sample Course
    const course = await Course.create({
      title: 'Full Stack MERN Mastery',
      description: 'Learn how to build scalable full-stack applications with MongoDB, Express, React, and Node.js.',
      thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
      is_published: true,
    });
    console.log('Created Course:', course.title);

    // Create Sample Videos
    const video1 = await Video.create({
      course_id: course._id,
      title: 'Introduction to Node.js & Express',
      description: 'Getting started with your backend server and architecture.',
      youtube_url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      order_index: 1,
      duration_text: '15 mins',
    });

    const video2 = await Video.create({
      course_id: course._id,
      title: 'Mastering MongoDB & Mongoose',
      description: 'Schemas, models, and CRUD operations.',
      youtube_url: 'https://www.youtube.com/watch?v=ofme2o29ngU',
      order_index: 2,
      duration_text: '20 mins',
    });
    console.log('Created Videos:', [video1.title, video2.title]);

    // Enroll student in the course
    await Enrollment.create({
      student_id: student._id,
      course_id: course._id,
      enrolled_by: admin._id,
      enrolled_at: new Date(),
    });
    console.log('Enrolled student in course.');

    console.log('\n--- Seeding Completed Successfully! ---');
    console.log('Admin login: admin@example.com / admin123');
    console.log('Student login: student@example.com / student123\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
