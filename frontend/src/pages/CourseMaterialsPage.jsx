import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { courseAPI } from '../services/api';

const CourseMaterialsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'PDF', url: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // 🛠️ Wrapped in useCallback to guarantee persistent memory address tracking for state hooks
  const fetchCourseDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await courseAPI.getCourseById(id);
      const courseData = res.data?.data || res.data;
      setCourse(courseData);
      setMaterials(courseData.materials || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading classroom details:", err);
      setMessage({ type: 'error', text: 'Failed to retrieve course study materials.' });
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handlePostMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.title.trim() || !newMaterial.type) return;

    setActionLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };

      const res = await apiClient.post(`/courses/${id}/materials`, newMaterial, config);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Material successfully uploaded!' });
        setMaterials(res.data.data || []);
        setNewMaterial({ title: '', type: 'PDF', url: '' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to publish material.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    setActionLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const config = { headers: {} };

      const res = await apiClient.delete(`/courses/${id}/materials/${materialId}`, config);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Material deleted successfully!' });
        setMaterials(res.data.data || []);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete material.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-slate-900 text-white p-8 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">{course?.category || 'General Domain'}</span>
          <h1 className="text-3xl font-black mt-1">{course?.title || 'Classroom Portal'}</h1>
        </div>
        <button onClick={() => navigate('/instructor/dashboard')} className="text-xs font-bold border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl transition-all shadow-sm">
          ← Main Dashboard
        </button>
      </div>

      {/* Classroom suite navigation tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px mb-8 overflow-x-auto">
        <button onClick={() => navigate(`/instructor/course/${id}/students`)} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 whitespace-nowrap">
          👥 Enrolled Roster
        </button>
        <button className="border-b-2 border-blue-600 px-4 py-2.5 text-sm font-bold text-blue-600 whitespace-nowrap">
          📂 Study Materials ({materials.length})
        </button>
        <button onClick={() => navigate(`/instructor/course/${id}/assignments`)} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 whitespace-nowrap">
          📝 Homework Logs
        </button>
        <button onClick={() => navigate(`/instructor/course/${id}/projects`)} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 whitespace-nowrap">
          💼 Projects Suite
        </button>
        <button onClick={() => navigate(`/instructor/course/${id}/assessments`)} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 whitespace-nowrap">
          📊 Exams & Grading
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-semibold border mb-6 shadow-sm ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Upload New Document</h3>
          <form onSubmit={handlePostMaterial} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Asset Document Title</label>
              <input 
                type="text" 
                value={newMaterial.title} 
                onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium" 
                placeholder="e.g. Chapter 3 Lab Manual Guide" 
                required 
                disabled={actionLoading}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Format Type Classification</label>
              <select 
                value={newMaterial.type} 
                onChange={e => setNewMaterial({...newMaterial, type: e.target.value})} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer text-sm font-medium"
                disabled={actionLoading}
              >
                <option value="PDF">Adobe PDF Document</option>
                <option value="Video">Video Stream File Link</option>
                <option value="Link">External Website Reference URI</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Material URL / Link (Optional)</label>
              <input 
                type="text" 
                value={newMaterial.url} 
                onChange={e => setNewMaterial({...newMaterial, url: e.target.value})} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium" 
                placeholder="e.g. https://drive.google.com/..." 
                disabled={actionLoading}
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving Material...' : 'Publish Material Asset'}
            </button>
          </form>
        </div>

        {/* Materials List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Active Classroom Catalog Attachments</h3>
          
          {materials.length === 0 ? (
            <p className="py-12 text-slate-400 text-sm text-center bg-slate-50 rounded-xl border border-dashed">
              No course study materials have been published yet.
            </p>
          ) : (
            <div className="space-y-3">
              {materials.map(mat => (
                <div key={mat._id} className="flex justify-between items-center p-4 border border-slate-100 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                      {mat.type === 'PDF' ? '📄' : mat.type === 'Video' ? '🎥' : '🔗'}
                    </span>
                    <div>
                      {mat.url ? (
                        <a 
                          href={mat.url.startsWith('http') ? mat.url : `https://${mat.url}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="font-bold text-blue-600 hover:underline text-sm md:text-base"
                        >
                          {mat.title}
                        </a>
                      ) : (
                        <h4 className="font-bold text-slate-800 text-sm md:text-base">{mat.title}</h4>
                      )}
                      <p className="text-xs text-slate-400 font-medium">
                        Released: {new Date(mat.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-wider shadow-sm">
                      {mat.type}
                    </span>
                    <button
                      onClick={() => handleDeleteMaterial(mat._id)}
                      className="text-xs text-rose-600 hover:bg-rose-50 p-2 rounded-lg font-bold transition-all"
                      disabled={actionLoading}
                    >
                      Delete
                    </button>
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

export default CourseMaterialsPage;