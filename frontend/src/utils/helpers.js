/**
 * Utility functions for frontend
 */

/**
 * Format date
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format price
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};

/**
 * Get star rating display
 */
export const getRatingStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push('⭐');
  }

  if (hasHalfStar) {
    stars.push('⭐️');
  }

  return stars.join('');
};

/**
 * Get progress color
 */
export const getProgressColor = (progress) => {
  if (progress < 25) return '#EF4444';
  if (progress < 50) return '#F97316';
  if (progress < 75) return '#FBBF24';
  return '#22C55E';
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Truncate text
 */
export const truncateText = (text, length = 100) => {
  if (text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Format duration (seconds to readable format)
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Sort courses by different criteria
 */
export const sortCourses = (courses, sortBy) => {
  const sorted = [...courses];

  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-high':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    default:
      return sorted;
  }
};

/**
 * Get discount percentage
 */
export const getDiscountPercentage = (originalPrice, discountPrice) => {
  if (originalPrice === 0) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};
