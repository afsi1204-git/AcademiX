const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB using your explicit connection path
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms');
    console.log(`Data Seeder Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

// Define a minimal course schema fallback to prevent module loading edge-cases
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructorName: { type: String, default: 'Admin Instructor' },
  price: { type: Number, default: 0 },
  category: { type: String, default: 'Web Development' },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

// Sample dataset array
const sampleCourses = [
  {
    title: 'Introduction to Full-Stack Web Development',
    description: 'Learn HTML5, CSS3, modern JavaScript, and the basics of building responsive applications.',
    instructorName: 'Prof. Afsheen',
    price: 49.99,
    category: 'Web Development',
    isPublished: true
  },
  {
    title: 'Mastering Node.js and Express Frameworks',
    description: 'Deep dive into server-side architectures, REST API designs, authentication systems, and middleware pipelines.',
    instructorName: 'Prof. Afsheen',
    price: 79.99,
    category: 'Backend Architecture',
    isPublished: true
  },
  {
    title: 'MongoDB Database Optimization Mastery',
    description: 'Understand core aggregation strategies, performance indexing patterns, schema structures, and data validation.',
    instructorName: 'Database Expert',
    price: 0, // Free Course
    category: 'Database Management',
    isPublished: true
  }
];

// Seeding engine logic execution
const importData = async () => {
  await connectDB();
  try {
    // Clean out existing course collections to avoid redundant duplication keys
    await Course.deleteMany();
    console.log('Old course collections purged successfully.');

    // Inject data
    await Course.insertMany(sampleCourses);
    console.log('Sample course database data successfully seeded! 🌱');
    process.exit();
  } catch (error) {
    console.error(`Data injection runtime error: ${error.message}`);
    process.exit(1);
  }
};

importData();