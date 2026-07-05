import React from 'react';
import { motion } from 'framer-motion';
import AnimatedButton from './AnimatedButton';

/**
 * Course Card component with animations
 */
const CourseCard = ({ course, onEnroll, index = 0 }) => {
  const discountPercentage = course?.discountPrice && course?.price
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8, boxShadow: '0 20px 35px rgba(0, 0, 0, 0.15)' }}
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all"
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
      {/* Course Thumbnail */}
      <img src={course?.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'} alt={course?.title} className="w-full h-48 object-cover" />
      {course?.isFeatured && (
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold"
        >
          FEATURED
        </motion.div>
      )}
      {discountPercentage > 0 && (
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold"
        >
          {discountPercentage}% OFF
        </motion.div>
      )}
      </motion.div>

      {/* Course Info */}
      <motion.div
        className="p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Category */}
        <div className="text-xs font-semibold text-blue-600 uppercase mb-2">{course?.category || 'General'}</div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{course?.title || 'Untitled Course'}</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course?.description || 'No description available.'}</p>

        {/* Instructor */}
        <div className="flex items-center mb-3">
          <img
            src={course?.instructor?.avatar || 'https://via.placeholder.com/30'}
            alt={course?.instructor?.name}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="text-sm text-gray-600">{course?.instructor?.name || 'Guest Faculty'}</span>
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm text-gray-600 mb-4">
         motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div>
            {course?.discountPrice ? (
              <div>
                <span className="text-lg font-bold text-gray-800">₹{course.discountPrice}</span>
                <span className="text-sm text-gray-500 line-through ml-2">₹{course.price}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-800">
                {course?.price === 0 || !course?.price ? 'Free' : `₹${course.price}`}
              </span>
            )}
          </div>
          <AnimatedButton
            onClick={() => onEnroll && onEnroll(course?._id)}
            variant="primary"
            size="sm"
          >
            Enroll
          </AnimatedButton>
        </motion.div>
      </motion.div>
    </motion.    >
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;