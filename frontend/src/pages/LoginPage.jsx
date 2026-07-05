import React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Cleaned traditional Email/Password login page with dynamic role routing
 */
const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Dispatch credentials down into your standard Redux architecture slice
    const result = await dispatch(loginUser(formData));
    
    // Check if login request was authorized and returned an authentication token
    if (result.payload?.token) {
      // Safely access user profile node parameters across varying payload configurations
      const loggedInUser = result.payload.user;
      const role = loggedInUser?.role;
      const email = loggedInUser?.email?.toLowerCase();

      // 🚀 DYNAMIC ROUTING BARRIER MATRIX:
      if (role === 'admin' || email === 'afsi1204@gmail.com') {
        console.log("Welcome Admin. Redirecting to management control matrix console...");
        navigate('/admin/dashboard');
      } else if (role === 'instructor') {
        console.log("Welcome Instructor. Navigating to curriculum portal interface...");
        navigate('/instructor/dashboard');
      } else {
        console.log("Welcome Student. Navigating to public course catalog grid...");
        // 🚀 FIXED: Now targets the exact path registered in App.jsx
        navigate('/student/my-courses');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-center text-gray-600 mb-8">Login to your EduHub account</p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 text-sm font-medium rounded-lg leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 transition-colors flex justify-center items-center"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;