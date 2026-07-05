import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser } from '../store/slices/authSlice';

/**
 * Account Registration Page featuring dynamic workflow logic for instructor validation queues
 */
const SignUpPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [errorMessage, setErrorMessage] = useState('');
  const [authProcessing, setAuthProcessing] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false); // Controls the confirmation layout matrix switch

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTraditionalSignUp = async (e) => {
    e.preventDefault();
    setAuthProcessing(true);
    setErrorMessage('');

    try {
      const result = await dispatch(registerUser(formData));
      
      if (result.payload?.success) {
        // 🚀 INSTRUCTOR APPROVAL MATRIX BARRIER:
        if (formData.role === 'instructor') {
          // Switch display layouts to block dashboard dispatch and let the user know their application is pending review
          setIsPendingApproval(true);
        } else {
          navigate('/student/my-courses');
        }
      } else {
        setErrorMessage(result.payload?.message || 'Registration layout configuration rejected.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration layout configuration rejected.');
    } finally {
      setAuthProcessing(false);
    }
  };

  // 🚀 CONFIRMATION SCREEN: Displayed only for pending instructor application pipelines
  if (isPendingApproval) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-6">
          <div className="text-6xl text-amber-500 animate-pulse">⏳</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Application Forwarded</h1>
            <p className="text-gray-600 text-sm">Your registration is currently under administrative evaluation.</p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-4 rounded-lg leading-relaxed text-left">
            Thank you for registering as an instructor on EduHub! Your profile has been queued for verification. You will be granted curriculum dashboard access once an administrator reviews your request credentials.
          </div>

          <Link
            to="/login"
            className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold text-center transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-6">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600 text-sm">Join EduHub and start learning today</p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-100 text-red-700 text-sm font-medium rounded-lg">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleTraditionalSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={authProcessing}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@domain.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={authProcessing}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={authProcessing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-gray-700"
              required
              disabled={authProcessing}
            >
              <option value="student">Student (Immediate Access)</option>
              <option value="instructor">Instructor (Requires Approval)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={authProcessing}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 transition-colors mt-2"
          >
            {authProcessing ? 'Registering Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignUpPage;
