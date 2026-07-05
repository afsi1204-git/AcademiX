// src/pages/ApplyCourseForm.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { enrollmentAPI } from '../services/api';

const ApplyCourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract course title passed via navigation state context
  const courseTitle = location.state?.courseTitle || "Selected Course";

  // Form states tracking new and existing student background variables
  const [formData, setFormData] = useState({
    studentName: '',
    phoneNumber: '',
    dateOfBirth: '',
    collegeName: '',
    courseType: 'UG', // Default selection matching undergraduate track tiering
    department: '',
    statementOfIntent: '',
    backgroundExperience: '',
    agreeTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Universal text input controller event map handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

 const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      setErrorMessage('You must acknowledge structural data profile verification terms.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await enrollmentAPI.enrollCourse({
        courseId: id,
        studentName: formData.studentName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        collegeName: formData.collegeName,
        courseType: formData.courseType,
        department: formData.department,
        statementOfIntent: formData.statementOfIntent,
        backgroundExperience: formData.backgroundExperience
      });

      alert('Application submitted. Your instructor will review it before the course workspace unlocks.');
      
      // Redirect the student straight to their active dashboard course list view
      navigate('/student/my-courses');
    } catch (err) {
      console.error('Submission runtime error state:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to submit enrollment credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-12 px-4 font-sans">
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xl p-8 animate-fade-in">
        
        {/* Header Block Section Component Display */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Course Entry Application</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            You are initiating an entry credential verification manifest context loop for:{' '}
            <strong className="text-blue-600 font-extrabold uppercase">{courseTitle}</strong>
          </p>
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 font-semibold p-4 rounded-xl text-xs mb-6">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmitApplication} className="space-y-5">
          
          {/* Row 1: Student Name & Phone Number Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Student Full Name</label>
              <input
                type="text"
                name="studentName"
                required
                placeholder="Enter your registered profile identity"
                value={formData.studentName}
                onChange={handleInputChange}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white text-sm p-3 rounded-xl transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Contact Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                required
                placeholder="Primary active contact string"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white text-sm p-3 rounded-xl transition-all outline-none"
              />
            </div>
          </div>

          {/* Row 2: Date of Birth & Course Type (UG / PG Selection) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white text-sm p-3 rounded-xl transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Course Track Tier (Program)</label>
              <select
                name="courseType"
                value={formData.courseType}
                onChange={handleInputChange}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white text-sm p-3 rounded-xl transition-all outline-none appearance-none cursor-pointer font-medium"
              >
                <option value="UG">Undergraduate (UG)</option>
                <option value="PG">Postgraduate (PG)</option>
              </select>
            </div>
          </div>

          {/* Row 3: College Name & Department Context Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">College Name (Graduates/Current)</label>
              <input
                type="text"
                name="collegeName"
                required
                placeholder="Official institutional designation text"
                value={formData.collegeName}
                onChange={handleInputChange}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white text-sm p-3 rounded-xl transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Department Name</label>
              <input
                type="text"
                name="department"
                required
                placeholder="e.g. Computer Science, Electrical Engineering"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white text-sm p-3 rounded-xl transition-all outline-none"
              />
            </div>
          </div>

          <hr className="border-slate-100 my-4" />

          {/* Textarea Area: Statement of Intent */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Statement of Intent (Why are you joining?)</label>
            <textarea
              name="statementOfIntent"
              rows="3"
              placeholder="Detail your educational objectives..."
              value={formData.statementOfIntent}
              onChange={handleInputChange}
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white text-sm p-3 rounded-xl transition-all outline-none resize-none"
            ></textarea>
          </div>

          {/* Textarea Area: Prior Domain Background */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Prior Domain Background or Context Experience</label>
            <textarea
              name="backgroundExperience"
              rows="3"
              placeholder="List prerequisites completed or equivalent career histories..."
              value={formData.backgroundExperience}
              onChange={handleInputChange}
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white text-sm p-3 rounded-xl transition-all outline-none resize-none"
            ></textarea>
          </div>

          {/* Terms Agreement Checkbox Element Block Layout */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 accent-blue-600 cursor-pointer"
            />
            <label htmlFor="agreeTerms" className="text-xs text-slate-500 select-none leading-relaxed cursor-pointer">
              I agree to submit this structural intent matrix profile data to the registry review operations controller desk.
            </label>
          </div>

          {/* Dynamic Interactive Flow Action Submission Panel Controls */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate('/courses')}
              className="w-1/2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold text-sm py-3.5 rounded-2xl transition-all text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-blue-200 text-center"
            >
              {isSubmitting ? 'Processing Submission...' : 'Submit Application'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ApplyCourseForm;
