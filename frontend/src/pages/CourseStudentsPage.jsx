// src/pages/CourseStudentsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, enrollmentAPI } from '../services/api';

const CourseStudentsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  // 🛠️ Wrapped in useCallback to ensure a stable reference profile for the dependency array
  const fetchClassroomDetails = useCallback(async () => {
    try {
      // Fetch course layout headers
      const courseRes = await courseAPI.getCourseById(id);
      setCourse(courseRes.data?.data || courseRes.data);

      // Fetch course entry application profiles map matching this track
      const appsRes = await enrollmentAPI.getCourseEnrollments(id);
      setApplications(appsRes.data?.data || appsRes.data || []);

      setLoading(false);
    } catch (err) {
      console.error("Error loading registry profiles maps:", err);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClassroomDetails();
  }, [fetchClassroomDetails]);

  // Handler layout logic to mutate applicant status criteria
  const handleUpdateStatus = async (applicationId, targetStatus) => {
    setActioningId(applicationId);
    try {
      // API endpoint updates registry profile status
      await enrollmentAPI.updateEnrollmentStatus(applicationId, targetStatus);
      
      // Refresh database profile list collection following status mutation state
      await fetchClassroomDetails();
    } catch (err) {
      console.error(`Failed to update application to ${targetStatus}:`, err);
      alert(err.response?.data?.message || 'Error processing status workflow transition rule.');
    } finally {
      setActioningId(null);
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
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <div className="bg-slate-900 text-white p-8 rounded-3xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg animate-fade-in">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">{course?.category || 'General Domain'}</span>
          <h1 className="text-3xl font-black mt-1">{course?.title || 'Classroom Portal'}</h1>
        </div>
        <button onClick={() => navigate('/instructor/dashboard')} className="mt-4 md:mt-0 text-xs font-bold border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl transition-all shadow-sm">
          ← Main Dashboard
        </button>
      </div>

      {/* Classroom suite navigation tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px mb-8 overflow-x-auto">
        <button className="border-b-2 border-blue-600 px-4 py-2.5 text-sm font-bold text-blue-600 whitespace-nowrap">
          👥 Admission Applications ({applications.length})
        </button>
        <button onClick={() => navigate(`/instructor/course/${id}/materials`)} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 whitespace-nowrap">
          📂 Study Materials
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

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Course Entry Application Registry Desk</h2>
        
        {applications.length === 0 ? (
          <p className="p-6 text-slate-400 text-sm text-center bg-slate-50 rounded-xl border border-dashed">
            No dynamic enrollment validation profiles have been mapped for this track path.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                <tr>
                  <th className="p-4">Applicant Profile</th>
                  <th className="p-4">Intent Statement / Prerequisite Context</th>
                  <th className="p-4">Submission Date</th>
                  <th className="p-4 text-center">Current Status</th>
                  <th className="p-4 text-center">Workflow Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {applications.map((e) => {
                  const student = e.student;
                  if (!student) return null;
                  const isProcessing = actioningId === e._id;

                  return (
                    <tr key={e._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Identity Column Grid Block Layout Component */}
                      <td className="p-4 max-w-[200px]">
                        <div className="font-bold text-slate-900 truncate">{student.name}</div>
                        <div className="text-slate-400 font-mono text-[11px] truncate">{student.email}</div>
                      </td>

                      {/* Intent Application Evaluation Data Panel Column */}
                      <td className="p-4 max-w-sm text-xs leading-relaxed">
                        <div className="text-slate-700 mb-1">
                          <strong className="text-slate-500 block text-[10px] uppercase font-bold tracking-wide">Intent:</strong> 
                          {e.statementOfIntent || <span className="text-slate-400 italic">No entry text supplied</span>}
                        </div>
                        <div className="text-slate-600">
                          <strong className="text-slate-500 block text-[10px] uppercase font-bold tracking-wide">Background:</strong> 
                          {e.backgroundExperience || <span className="text-slate-400 italic">No historical log details</span>}
                        </div>
                      </td>

                      {/* Registry Mapping Logs Record Row Node */}
                      <td className="p-4 text-slate-400 font-normal text-xs whitespace-nowrap">
                        {e.enrollmentDate || e.createdAt ? new Date(e.enrollmentDate || e.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Status Metadata Chip Framework Node Column */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md border capitalize ${
                          e.status === 'active' || e.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : e.status === 'rejected' || e.status === 'declined'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {e.status === 'active' ? 'Approved' : e.status}
                        </span>
                      </td>

                      {/* Dynamic Workflow Interactive Processing Buttons Component Layout Matrix */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {e.status === 'pending' ? (
                          <div className="flex gap-2 justify-center items-center">
                            <button
                              disabled={isProcessing}
                              onClick={() => handleUpdateStatus(e._id, 'active')}
                              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              disabled={isProcessing}
                              onClick={() => handleUpdateStatus(e._id, 'rejected')}
                              className="bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 border border-rose-200 font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-normal italic">Evaluated</span>
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
    </div>
  );
};

export default CourseStudentsPage;