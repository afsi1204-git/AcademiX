import React from 'react';
import { motion } from 'framer-motion';

/**
 * Page Transition Component - Smooth page entrance animations
 */
const PageTransition = ({ children, direction = 'up' }) => {
  const variants = {
    up: {
      initial: { opacity: 0, y: 28, scale: 0.985 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -24, scale: 0.985 }
    },
    left: {
      initial: { opacity: 0, x: -28, scale: 0.985 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: 28, scale: 0.985 }
    },
    right: {
      initial: { opacity: 0, x: 28, scale: 0.985 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -28, scale: 0.985 }
    },
    fade: {
      initial: { opacity: 0, scale: 0.985 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.985 }
    }
  };

  const current = variants[direction] || variants.up;

  return (
    <motion.div
      initial={current.initial}
      animate={current.animate}
      exit={current.exit}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-[calc(100vh-73px)]"
    >
      <motion.div
        className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/10 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      />
      {children}
    </motion.div>
  );
};

export default PageTransition;
