// src/pages/CourseWorkspaceSuite.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const CourseWorkspaceSuite = ({ courseId, courseTitle, onBack }) => {
  const [activeTab, setActiveTab] = useState('materials');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTabContent = async () => {
      setLoading(true);
      setError('');
      setContent([]); // Clear past values before fetching new ones
      
      try {
        const endpoint = `/courses/${courseId}/${activeTab}`;
        const res = await apiClient.get(endpoint);
        
        // Ensure content is strictly an array even if the backend returns a wrapper object
        if (Array.isArray(res.data)) {
          setContent(res.data);
        } else if (Array.isArray(res.data?.data)) {
          setContent(res.data.data);
        } else if (Array.isArray(res.data?.[activeTab])) {
          setContent(res.data[activeTab]);
        } else {
          setContent([]); // Default fallback to prevent crash loops
        }
      } catch (err) {
        console.error(`Error loading ${activeTab}:`, err);
        setError(err.response?.data?.message || `Failed to retrieve course ${activeTab}.`);
        setContent([]); // Guarantee safe array space on catch block execution
      } finally {
        setLoading(false);
      }
    };
    fetchTabContent();
  }, [courseId, activeTab]);

  // Defensive runtime guard loop verifying array properties before template mounting
  const safeContent = Array.isArray(content) ? content : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans text-left">
      <button onClick={onBack} className="text-xs font-bold text-slate-500 hover:text-slate-800 mb-4 transition-colors">
        ← Back to All Courses
      </button>
      <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6 shadow-sm">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Classroom Workspace</span>
        <h1 className="text-2xl font-black mt-1 uppercase tracking-tight">{courseTitle}</h1>
      </div>

      {/* Tabs Row Navigation Links */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        {['materials', 'assignments', 'assessments', 'grades'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'materials' && '📁 Study Materials'}
            {tab === 'assignments' && '📝 Homework Logs'}
            {tab === 'assessments' && '💼 Projects Suite'}
            {tab === 'grades' && '📊 Exams & Grading'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 font-semibold p-4 rounded-xl text-xs mb-6">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[250px]">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div>
            {/* Materials Panel View Context */}
            {activeTab === 'materials' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Available Study Content</h3>
                {safeContent.length === 0 ? <p className="text-xs text-slate-400">No review lectures shared by faculty yet.</p> : 
                  safeContent.map((m, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">📄 {m.title || `Material Lecture ${i+1}`}</span>
                      {m.url && <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">Download</a>}
                    </div>
                  ))
                }
              </div>
            )}

            {/* Assignments Panel View Context */}
            {activeTab === 'assignments' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Pending Assignments</h3>
                {safeContent.length === 0 ? <p className="text-xs text-slate-400">No active assignment deadlines posted.</p> : 
                  safeContent.map((a, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                      <div className="flex justify-between font-bold text-slate-800 mb-1">
                        <span>✏️ {a.title}</span>
                        {a.dueDate && <span className="text-rose-500">Due: {new Date(a.dueDate).toLocaleDateString()}</span>}
                      </div>
                      <p className="text-slate-500">{a.description}</p>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Assessments Panel View Context */}
            {activeTab === 'assessments' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Projects & Examinations</h3>
                {safeContent.length === 0 ? <p className="text-xs text-slate-400">No projects currently issued.</p> : 
                  safeContent.map((p, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                      <div className="font-bold text-slate-800 mb-1">🚀 {p.title}</div>
                      <p className="text-slate-500 text-xs">{p.guidelines || p.description}</p>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Grades Panel View Context */}
            {activeTab === 'grades' && (
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4">Faculty Grading Evaluation Ledger</h3>
                {safeContent.length === 0 ? <p className="text-xs text-slate-400">No score updates published for your profile yet.</p> : 
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="p-3">Evaluation Task Name</th>
                          <th className="p-3">Score Achieved</th>
                          <th className="p-3">Faculty Feedback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {safeContent.map((g, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-700">{g.taskName || g.title}</td>
                            <td className="p-3 font-bold text-blue-600">{g.score || g.marks} / 100</td>
                            <td className="p-3 text-slate-500 italic">{g.feedback || 'None'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseWorkspaceSuite;