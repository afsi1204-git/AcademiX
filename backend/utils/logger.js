const InstructorLog = require('../models/InstructorLog');

/**
 * Logs an instructor action for accountability.
 * @param {string} instructorId - The ObjectId string of the instructor
 * @param {string} action - The action string (e.g. "Create Course", "Upload Material")
 * @param {string} details - A brief description details string
 */
exports.logInstructorAction = async (instructorId, action, details) => {
  try {
    await InstructorLog.create({
      instructor: instructorId,
      action,
      details,
    });
    console.log(`[Instructor Log] ${action} by ${instructorId}: ${details}`);
  } catch (error) {
    console.error(`[Instructor Log Error] Failed to create log: ${error.message}`);
  }
};
