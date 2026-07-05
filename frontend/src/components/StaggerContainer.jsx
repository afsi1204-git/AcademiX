import React from 'react';
import { motion } from 'framer-motion';

/**
 * Stagger Container - Animates children in sequence
 */
const StaggerContainer = ({ children, delay = 0 }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child) =>
        <motion.div variants={itemVariants}>
          {child}
        </motion.div>
      )}
    </motion.div>
  );
};

export default StaggerContainer;
