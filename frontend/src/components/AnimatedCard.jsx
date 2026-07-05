import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated Card Component - Smooth entrance with hover effects
 */
const AnimatedCard = ({ 
  children, 
  delay = 0, 
  className = '',
  onClick,
  hoverEffect = 'lift'
}) => {
  const hoverVariants = {
    lift: { y: -8, boxShadow: '0 20px 35px rgba(0, 0, 0, 0.2)' },
    scale: { scale: 1.05 },
    glow: { boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverVariants[hoverEffect]}
      onClick={onClick}
      className={`transition-shadow ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
