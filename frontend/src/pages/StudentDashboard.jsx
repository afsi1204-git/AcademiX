// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { enrollmentAPI } from '../services/api';
import CourseWorkspaceSuite from './CourseWorkspaceSuite';

const StudentDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await enrollmentAPI.getMyEnrollments();
        setEnrollments(res.data?.data || []);
      } catch (err) {
        console.error('Dashboard retrieval error:', err);
        setError('Failed to sync registered course records.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (selectedCourse) {
    return (
      <CourseWorkspaceSuite 
        courseId={selectedCourse._id} 
        courseTitle={selectedCourse.title} 
        onBack={() => setSelectedCourse(null)} 
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      <div className="border-b border-slate-100 pb-5 mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Registered Courses</h1>
        <p className="text-sm text-slate-500 mt-1">Access your academic workspaces, faculty assignments, and grades.</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-700 text-xs font-semibold mb-6">{error}</div>}

      {!loading && enrollments.length === 0 && (
        <div className="text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12">
          <p className="text-slate-400 font-medium text-sm">You haven't registered for any course paths yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {enrollments.map((item) => {
          const course = item.course;
          if (!course) return null;
          return (
            <div 
              key={item._id}
              onClick={() => setSelectedCourse(course)}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group text-left"
            >
              <div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Active Enrollment
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                  Progress Metric: {item.progress || 0}% Completed
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Enter Classroom Workspace →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDashboard;