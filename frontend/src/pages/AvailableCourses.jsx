import React, { useEffect, useState } from 'react';
import { courseAPI, enrollmentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AvailableCourses = () => {
  const navigate = useNavigate();

  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4500);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  useEffect(() => {
    fetchMarketplaceCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMarketplaceCourses = async () => {
    setLoading(true);
    try {
      // 1. Fetch all system courses globally available
      const coursesRes = await courseAPI.getCourses();
      const allCourses = coursesRes.data?.data || coursesRes.data?.courses || coursesRes.data || [];

      // 2. Fetch from the EXACT same dashboard endpoint to see what the student owns
      let registeredCourseIds = [];
      try {
        const dashboardRes = await enrollmentAPI.getMyEnrollments();
        const enrollments = dashboardRes.data?.data || [];
        
        if (Array.isArray(enrollments)) {
          registeredCourseIds = enrollments
            .map(item => item.course?._id || item.course?.id)
            .filter(Boolean)
            .map(id => String(id));
        }
      } catch (err) {
        console.warn("Could not sync with dashboard endpoint:", err.message);
      }

      // 3. Filter: Exclude courses that are already in the dashboard
      const unownedCourses = Array.isArray(allCourses) 
        ? allCourses.filter(course => {
            if (!course) return false;
            const currentId = String(course._id || course.id);
            return !registeredCourseIds.includes(currentId);
          })
        : [];
      
      setAvailableCourses(unownedCourses);
    } catch (err) {
      console.error('API Catalog Parse Error:', err);
      setMessage({ 
        type: 'error', 
        text: '🚨 Failed to process the backend course catalog data.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      let enrollmentSuccess = false;
      try {
        await enrollmentAPI.enrollCourse({ courseId });
        enrollmentSuccess = true;
      } catch (e) {
        enrollmentSuccess = false;
      }

      if (!enrollmentSuccess) {
        navigate(`/courses/${courseId}/apply`);
        return;
      }

      // OPTIMISTIC UPDATE: Remove it from the UI immediately
      setAvailableCourses(prevCourses => 
        prevCourses.filter(course => String(course._id || course.id) !== String(courseId))
      );

      setMessage({ type: 'success', text: '🎉 Successfully registered! Added to dashboard.' });
      
      // Background re-fetch after backend catches up
      setTimeout(() => {
        fetchMarketplaceCourses();
      }, 1000);
      
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Enrollment request processing encountered an issue.' 
      });
    }
  };

  const filteredCourses = availableCourses.filter(course =>
    course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 hover:bg-slate-100 rounded-xl transition-all text-slate-600 text-sm font-bold flex items-center justify-center border border-slate-200 bg-white shadow-sm"
            >
              ⬅️ Back to Dashboard
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">🎓 Explore Available Courses</h1>
              <p className="text-slate-400 text-xs mt-0.5">Discover educational journeys and expand your active curriculum stack.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Filter by title..."
              className="w-full md:w-64 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-medium bg-white"
            />
            {message.text && (
              <div className={`px-4 py-2 rounded-xl text-xs font-bold border shadow-sm whitespace-nowrap ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        {/* Catalog Yield Layout Grid */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-slate-400 text-xs">Scanning available learning blocks...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 shadow-sm">
            <span className="text-4xl block mb-3">⭐</span>
            <h3 className="text-base font-bold text-slate-700">No New Courses Available</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1">
              You are currently registered for all system courses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              if (!course) return null;
              const priceVal = Number(course.price);

              return (
                <div 
                  key={course._id || course.id} 
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6">
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border border-blue-100">
                      {course.category || 'Curriculum'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 my-2 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">
                      {course.description || 'No descriptive guide available for this course.'}
                    </p>
                  </div>

                  <div className="bg-slate-50/70 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-800">
                      {(!priceVal || priceVal === 0) ? 'Free' : `₹${priceVal}`}
                    </span>
                    <button
                      onClick={() => handleEnroll(course._id || course.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      Enroll Now →
                    </button>
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

export default AvailableCourses;