import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { courseAPI } from '../services/api';

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateCourseForm, setShowCreateCourseForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
  });

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  const fetchTeacherCourses = async () => {
    try {
      setLoading(true);

      const response = await courseAPI.getInstructorCourses();

      if (response.data.success) {
        setCourses(response.data.data || []);

        // Calculate stats
        const totalStudents = response.data.data.reduce(
          (sum, course) => sum + (course.enrolledStudents?.length || 0),
          0
        );

        setStats({
          totalCourses: response.data.data.length,
          totalStudents: totalStudents,
          totalAssignments: response.data.data.reduce(
            (sum, course) => sum + (course.assignments?.length || 0),
            0
          ),
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await courseAPI.createCourse(formData);

      if (response.data.success) {
        setShowCreateCourseForm(false);
        setFormData({ title: '', description: '', category: '', price: 0 });
        fetchTeacherCourses();
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) : value,
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'Instructor'}!</p>
          </div>
          <button
            onClick={() => setShowCreateCourseForm(!showCreateCourseForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            + Create New Course
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-4 rounded-lg">
                <span className="text-blue-600 text-3xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Courses</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-4 rounded-lg">
                <span className="text-green-600 text-3xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-4 rounded-lg">
                <span className="text-purple-600 text-3xl">✓</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalAssignments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Course Form */}
        {showCreateCourseForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Course</h2>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Introduction to React"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Write a brief description about your course..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="science">Science</option>
                    <option value="language">Language</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) - Leave 0 for Free
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold transition"
                >
                  Create Course
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCourseForm(false);
                    setFormData({ title: '', description: '', category: '', price: 0 });
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courses List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h2>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">You haven't created any courses yet</p>
              <button
                onClick={() => setShowCreateCourseForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="border border-gray-200 rounded-lg hover:shadow-lg transition overflow-hidden"
                >
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {course.category}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span>👥 {course.enrolledStudents?.length || 0} students</span>
                    </div>

                    <Link
                      to={`/teacher/course/${course._id}`}
                      className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold text-center transition"
                    >
                      Manage Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
