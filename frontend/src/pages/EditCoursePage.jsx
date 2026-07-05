import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { courseAPI } from '../services/api';

const EditCoursePage = () => {
  const { id } = useParams(); // Extracts the exact course MongoDB _id from the URL string
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Web Development',
    instructorName: '',
  });

  // 📡 Fetch the exact course details on mount to populate the form fields
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        console.log(`📡 Fetching details for course document ID: ${id}`);
        const res = await courseAPI.getCourseById(id);
        // Match response data nesting safely
        const course = res.data?.data || res.data;

        if (course) {
          setFormData({
            title: course.title || '',
            description: course.description || '',
            price: course.price !== undefined ? course.price : '',
            category: course.category || 'Web Development',
            instructorName: course.instructorName || user?.name || 'Santhiya P',
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to fetch course detail lines:', err);
        setMessage('❌ Error pulling active document from database cloud collection clusters.');
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id, user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const preciseMongoosePayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price) || 0,
        category: formData.category,
        isPublished: true,
        status: 'published',
      };

      console.log(`📡 Committing PUT update for record identification index: ${id}`);
      await courseAPI.updateCourse(id, preciseMongoosePayload);

      setMessage('🎉 Course successfully modernized and updated in MongoDB!');
      
      // Redirect back to main center dashboard matrix view panel after 1.5 seconds
      setTimeout(() => {
        navigate('/instructor/dashboard');
      }, 1500);

    } catch (err) {
      console.error('❌ Update transmission pipeline failure:', err);
      const errReason = err.response?.data?.message || err.response?.data?.error || 'Validation error.';
      setMessage(`❌ Schema Update Fail: ${errReason}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-slate-400 text-sm">Hydrating document state maps from cluster collections...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mt-8">
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">📝 Modify Asset Controls</h2>
          <p className="text-gray-400 text-xs mt-1">Re-write data matrix definitions directly onto MongoDB schema layers.</p>
        </div>

        {message && (
          <div className="mb-5 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm font-semibold border border-blue-200">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdateCourse} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Course Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Instructor Signature</label>
              <input
                type="text"
                name="instructorName"
                value={formData.instructorName}
                readOnly
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Price Rate (INR)</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category Track Domain</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="Web Development">Web Development</option>
              <option value="Backend Architecture">Backend Architecture</option>
              <option value="Database Management">Database Management</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description Overview</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="5"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button" 
              onClick={() => navigate('/instructor/dashboard')} 
              className="w-1/3 bg-slate-100 hover:bg-slate-200 py-3.5 rounded-xl font-bold text-slate-700 transition-all"
            >
              Back to Panel
            </button>
            <button 
              type="submit" 
              className="w-2/3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md"
            >
              Commit Mutations
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCoursePage;