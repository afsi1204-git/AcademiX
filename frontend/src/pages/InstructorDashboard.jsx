// src/pages/InstructorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { courseAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const InstructorDashboard = ({ viewMode, setViewMode }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); 
  
  const [localViewMode, setLocalViewMode] = useState('list');
  const activeViewMode = viewMode !== undefined ? viewMode : localViewMode;
  const activeSetViewMode = setViewMode !== undefined ? setViewMode : setLocalViewMode;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    weeks: 8,
    instructorName: '',
  });

  const instructorObjectId = user?._id || user?.id || user?.user?._id || user?.user?.id || '';
  const currentInstructorName = user?.name || user?.user?.name || 'Santhiya P';

  useEffect(() => {
    if (currentInstructorName) {
      setFormData(prev => ({ ...prev, instructorName: currentInstructorName }));
    }
  }, [user, currentInstructorName]);

  useEffect(() => {
    fetchGlobalDatabaseCatalog();
  }, []);

  // API base is provided by `apiClient` and service wrappers

  const fetchGlobalDatabaseCatalog = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching global database catalog from backend API...");
      const res = await courseAPI.getCourses();
      
      let extractedArray = [];
      if (res.data && Array.isArray(res.data.data)) {
        extractedArray = res.data.data;
      } else if (Array.isArray(res.data)) {
        extractedArray = res.data;
      } else if (res.data && typeof res.data === 'object') {
        extractedArray = res.data.courses || res.data.catalog || [];
      }
      
      setCourses(extractedArray);
      setLoading(false);
    } catch (err) {
      console.error('❌ Failed to poll catalog collection documents:', err);
      setCourses([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'weeks' ? Number(value) : value,
    });
  };

  const handleCreateCourse = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    console.log('📝 submit course form', formData);

    try {
      const preciseMongoosePayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: 0,
        weeks: formData.weeks,
        isPublished: true,
        status: 'published',
      };

      await courseAPI.createCourse(preciseMongoosePayload);
      
      setFormData({
        title: '',
        description: '',
        weeks: 8,
        instructorName: currentInstructorName
      });

      setMessage('🎉 Course successfully committed and synchronized live inside MongoDB!');
      activeSetViewMode('list');
      await fetchGlobalDatabaseCatalog();

    } catch (err) {
      console.error('❌ Backend pipeline rejected write operation:', err);
      const errReason = err.response?.data?.message || err.message || 'Validation write fail.';
      console.log('Error details:', { status: err.response?.status, data: err.response?.data });
      setMessage(`❌ Error: ${errReason}`);
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (!course) return false;
    
    const structuralName = course.instructorName || 
                           (typeof course.instructor === 'object' && course.instructor?.name) || 'Unknown';

    const titleMatch = (course.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const instructorMatch = structuralName.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || instructorMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto p-6">
        
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-2">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">🎓 Instructor Control Center</h1>
            <p className="text-gray-500 text-sm mt-1">Manage, update, or append live catalogue asset rows dynamically.</p>
          </div>
          {message && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-semibold border border-emerald-200 shadow-sm transition-all animate-fade-in">
              {message}
            </div>
          )}
        </div>

        {activeViewMode === 'create' ? (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">🚀 Course Creator Wizard</h2>
            <form onSubmit={handleCreateCourse} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Course Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="e.g., Mastering Node.js and Express Frameworks"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Instructor</label>
                <input
                  type="text"
                  name="instructorName"
                  value={formData.instructorName}
                  readOnly
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Course Duration (Weeks)</label>
                <input
                  type="number"
                  name="weeks"
                  value={formData.weeks}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="52"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="e.g., 8"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description Overview</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Provide a quick syllabus outline..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => activeSetViewMode('list')} 
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 py-3.5 rounded-xl font-bold text-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  onClick={handleCreateCourse}
                  className="w-2/3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md"
                >
                  Publish Dynamic Asset
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800">📚 Complete Database Catalogue Inventory</h2>
              <div className="w-full md:w-80 relative">
                <input
                  type="text"
                  placeholder="🔍 Search by course or instructor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-slate-400 text-xs">Querying collection clusters...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">The underlying database returned no active matching document rows.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="p-4">Course Title</th>
                      <th className="p-4">Assigned Instructor</th>
                      <th className="p-4">Category Track</th>
                      <th className="p-4 text-right">Actions Mapping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
                    {filteredCourses.map((course) => {
                      if (!course) return null;
                      
                      const actualInstructorIdStr = course.instructor && typeof course.instructor === 'object'
                        ? (course.instructor._id || course.instructor.id || '')
                        : (course.instructor || course.instructorId || '');
                        
                      // FIXED LOGIC: Match by ID alignment OR explicitly by matching text names 
                      const isCreator = (instructorObjectId && String(actualInstructorIdStr) === String(instructorObjectId)) ||
                        (course.instructorName && String(course.instructorName).toLowerCase() === String(currentInstructorName).toLowerCase());
                      
                      const resolvedInstructorDisplayName = course.instructorName || 
                        (typeof course.instructor === 'object' && course.instructor?.name) || 
                        (isCreator ? currentInstructorName : 'Unknown Instructor');
                      
                      return (
                        <tr key={course._id || Math.random()} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4 font-semibold text-slate-900">{course.title || "Untitled Record"}</td>
                          <td className="p-4 text-slate-600 font-medium">{resolvedInstructorDisplayName}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100 whitespace-nowrap">
                              {course.category || "General"}
                            </span>
                          </td>
                          <td className="p-4 text-right flex items-center justify-end gap-2">
                            
                            {isCreator ? (
                              <button 
                                onClick={() => navigate(`/instructor/course/${course._id}/students`)} 
                                className="text-indigo-600 text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                              >
                                👥 Class Roster
                              </button>
                            ) : (
                              <button 
                                disabled
                                title="Access Denied: Only the creator has clearance to manage rosters"
                                className="text-slate-300 text-xs bg-slate-50 px-3 py-1.5 rounded-lg font-bold cursor-not-allowed border border-gray-100"
                              >
                                🔒 Class Roster
                              </button>
                            )}
                            
                            {isCreator ? (
                              <button 
                                onClick={() => navigate(`/instructor/edit-course/${course._id}`)} 
                                className="text-slate-600 text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                              >
                                Modify
                              </button>
                            ) : (
                              <button 
                                disabled
                                title="Access Denied: Only the assigned instructor can edit this asset"
                                className="text-slate-300 text-xs bg-slate-50 px-3 py-1.5 rounded-lg font-bold cursor-not-allowed border border-gray-100"
                              >
                                🔒 Modify
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;