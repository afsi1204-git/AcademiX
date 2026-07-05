/**
 * Helper functions and utilities
 */

/**
 * Format date to readable string
 */
exports.formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Calculate course progress
 */
exports.calculateProgress = (completedLessons, totalLessons) => {
  if (totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
};

/**
 * Get discount percentage
 */
exports.getDiscountPercentage = (originalPrice, discountPrice) => {
  if (originalPrice === 0) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};

/**
 * Paginate results
 */
exports.paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

/**
 * Generate unique ID
 */
exports.generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Generate certificate ID
 */
exports.generateCertificateId = (studentName, courseName, timestamp) => {
  const sanitized =
    (studentName + courseName).replace(/\s+/g, '').toUpperCase() +
    '-' +
    timestamp;
  return sanitized;
};

/**
 * Get file extension
 */
exports.getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Format currency
 */
exports.formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Get duration in readable format (e.g., "2h 30m")
 */
exports.formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Get random color
 */
exports.getRandomColor = () => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Check if email is domain restricted (for organizations)
 */
exports.isAllowedEmailDomain = (email, allowedDomains) => {
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
};

/**
 * Generate search filter query
 */
exports.buildSearchQuery = (searchTerm, fields) => {
  const regex = new RegExp(searchTerm, 'i');
  return {
    $or: fields.map((field) => ({
      [field]: regex,
    })),
  };
};
