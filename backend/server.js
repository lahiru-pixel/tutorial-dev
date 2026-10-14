require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const videosRoutes = require('./routes/videos');
const adminRoutes = require('./routes/admin');
const studentsRoutes = require('./routes/students');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
