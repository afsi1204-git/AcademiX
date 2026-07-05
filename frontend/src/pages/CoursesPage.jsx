import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseAPI.getCourses();
        
        if (res.data && Array.isArray(res.data.data)) {
          setCourses(res.data.data);
        } else if (Array.isArray(res.data)) {
          setCourses(res.data);
        } else {
          setCourses([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching catalog courses:', err);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleEnrollClick = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-6 font-sans">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">
          Explore Available Courses
        </h1>
        
        {courses.length === 0 ? (
          <div className="bg-white py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl font-medium shadow-sm">
            No courses are currently available in the system catalog records.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              if (!course) return null;

              return (
                <div 
                  key={course._id || Math.random().toString()} 
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200 p-6"
                >
                  {/* Course Context Body */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {course.level || 'Beginner'}
                        </span>
                        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-2.5 py-1 rounded-lg">
                          {course.category || 'General'}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 line-clamp-2 leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 text-sm mt-2 line-clamp-3">
                        {course.description || 'No overview layout text provided for this course asset.'}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <span className="font-medium text-slate-700 flex items-center gap-1">
                          👤 {course.instructor?.name || 'Academic Faculty'}
                        </span>
                      </div>

                      {/* ✅ FIXED: Price element removed entirely; button shifted to the right */}
                      <div className="flex justify-end">
                        <button 
                          onClick={handleEnrollClick}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                        >
                          Enroll
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;