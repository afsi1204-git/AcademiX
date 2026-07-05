// backend/models/Course.js
const mongoose = require('mongoose');

// Course Schema
const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a course title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Programming',
        'Web Development',
        'Mobile Development',
        'Data Science',
        'AI/ML',
        'Cloud Computing',
        'DevOps',
        'UI/UX Design',
        'Business',
        'Backend Architecture',   // Added to resolve frontend creation errors
        'Database Management',    // Added to resolve frontend creation errors
        'Other',
      ],
      required: false,
      default: 'Other',
    },
    weeks: {
      type: Number,
      default: 8,
      min: [1, 'Course duration must be at least 1 week'],
      max: [52, 'Course duration cannot exceed 52 weeks'],
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    thumbnail: {
      type: String,
      required: false, // Changed to false so your submission doesn't fail without a file upload input
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500', // Safe default fallback link
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    sections: [
      {
        title: {
          type: String,
        },
        description: String,
        lessons: [
          {
            _id: mongoose.Schema.Types.ObjectId,
            title: {
              type: String,
            },
            description: String,
            videoUrl: String,
            videoDuration: Number, // in seconds
            resources: [
              {
                title: String,
                url: String,
                type: {
                  type: String,
                  enum: ['pdf', 'document', 'link', 'image'],
                },
              },
            ],
            order: Number,
            isPublished: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],
    materials: [
      {
        title: { type: String },
        type: { type: String, enum: ['PDF', 'Video', 'Link'] },
        url: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    assignments: [
      {
        title: { type: String },
        description: { type: String },
        deadline: { type: Date },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    projects: [
      {
        title: { type: String },
        description: { type: String },
        deadline: { type: Date },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    learningOutcomes: [String],
    requirements: [String],
    tags: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for search functionality
CourseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', CourseSchema);
