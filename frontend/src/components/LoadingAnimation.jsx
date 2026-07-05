import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated Loading Spinner Component
 */
const LoadingAnimation = ({ text = 'Loading...' }) => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const dotVariants = {
    animate: {
      y: [-8, 0, -8],
      transition: {
        duration: 0.6,
        repeat: Infinity
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <motion.div
        className="flex gap-2"
        variants={containerVariants}
        animate="animate"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-blue-600 rounded-full"
            variants={dotVariants}
          />
        ))}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-600 text-lg"
      >
        {text}
      </motion.p>
    </div>
  );
};

export default LoadingAnimation;
