import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { courseAPI } from '../services/api';

const CourseProjectsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [projects, setProjects] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // Form State
  const [newProject, setNewProject] = useState({ title: '', description: '', deadline: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // 🛠️ Wrapped in useCallback to preserve the reference profile across rendering cycles
  const fetchClassroomDetails = useCallback(async () => {
    setLoading(true);
    try {
      // Get Course Details
      const courseRes = await courseAPI.getCourseById(id);
      const courseData = courseRes.data?.data || courseRes.data;
      setCourse(courseData);
      setProjects(courseData.projects || []);

      // Get student grades/marks roster
      const gradesRes = await apiClient.get(`/courses/${id}/grades`);
      setStudentGrades(gradesRes.data?.grades || []);

      if (courseData.projects && courseData.projects.length > 0) {
        setSelectedProject(courseData.projects[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading classroom details:", err);
      setMessage({ type: 'error', text: 'Failed to retrieve course projects.' });
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClassroomDetails();
  }, [fetchClassroomDetails]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;

    setActionLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };

      const res = await apiClient.post(`/courses/${id}/projects`, newProject, config);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Project assigned successfully!' });
        setProjects(res.data.data || []);
        setNewProject({ title: '', description: '', deadline: '' });
        
        // Refresh full roster grades
        const freshGrades = await apiClient.get(`/courses/${id}/grades`);
        setStudentGrades(freshGrades.data?.grades || []);

        if (res.data.data && res.data.data.length > 0) {
          setSelectedProject(res.data.data[res.data.data.length - 1]);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create project.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? Recorded student marks will be deleted.")) {
      return;
    }

    setActionLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const config = { headers: {} };

      const res = await apiClient.delete(`/courses/${id}/projects/${projectId}`, config);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Project deleted.' });
        const remaining = res.data.data || [];
        setProjects(remaining);
        
        if (selectedProject?._id === projectId) {
          setSelectedProject(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete project.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGradeChange = async (studentId, projectId, marksVal) => {
    try {
      const marks = Number(marksVal) || 0;

      await apiClient.put(`/courses/${id}/grades/project`, {
        studentId,
        projectId,
        marks
      });

      // Local state update
      setStudentGrades(prevGrades => 
        prevGrades.map(sg => {
          if (sg.studentId === studentId) {
            const marksIndex = sg.projectMarks.findIndex(pm => pm.projectId === projectId);
            const freshMarks = [...sg.projectMarks];
            if (marksIndex > -1) {
              freshMarks[marksIndex] = { ...freshMarks[marksIndex], marks };
            } else {
              freshMarks.push({ projectId, marks, status: 'Graded' });
            }
            return { ...sg, projectMarks: freshMarks };
          }
          return sg;
        })
      );
    } catch (err) {
      console.error("Failed to update student project marks:", err);
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
        <button onClick={() => navigate(`/instructor/course/${id}/materials`)} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 whitespace-nowrap">
          📂 Study Materials
        </button>
        <button onClick={() => navigate(`/instructor/course/${id}/assignments`)} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 whitespace-nowrap">
          📝 Homework Logs
        </button>
        <button className="border-b-2 border-blue-600 px-4 py-2.5 text-sm font-bold text-blue-600 whitespace-nowrap">
          💼 Projects Suite ({projects.length})
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
        
        {/* Left column: Assign New Project / Projects List */}
        <div className="flex flex-col gap-6 h-fit">
          {/* Creator form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Assign New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Project Title</label>
                <input 
                  type="text" 
                  value={newProject.title} 
                  onChange={e => setNewProject({...newProject, title: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium" 
                  placeholder="e.g. Capstone Web Architecture App" 
                  required 
                  disabled={actionLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Project Guidelines</label>
                <textarea
                  value={newProject.description} 
                  onChange={e => setNewProject({...newProject, description: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium" 
                  placeholder="Detailed requirements for students..." 
                  rows="3"
                  disabled={actionLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Due Deadline Date</label>
                <input 
                  type="date" 
                  value={newProject.deadline} 
                  onChange={e => setNewProject({...newProject, deadline: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium" 
                  disabled={actionLoading}
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                disabled={actionLoading}
              >
                {actionLoading ? 'Assigning...' : 'Assign Project'}
              </button>
            </form>
          </div>

          {/* Projects list */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
            <h3 className="text-base font-bold text-slate-800">Projects Inventory</h3>
            {projects.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6 bg-slate-50 rounded-xl border border-dashed">No projects assigned.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {projects.map(proj => (
                  <div 
                    key={proj._id}
                    onClick={() => setSelectedProject(proj)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center ${
                      selectedProject?._id === proj._id 
                        ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-sm' 
                        : 'bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate max-w-[150px]">
                      <h4 className="font-bold text-sm truncate">{proj.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Due: {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'No limit'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(proj._id);
                      }}
                      className="text-xs text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg"
                      disabled={actionLoading}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Students list & Grade Entry Spreadsheet */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {selectedProject ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Active Evaluated Project</span>
                <h3 className="text-xl font-bold mt-0.5">{selectedProject.title}</h3>
                {selectedProject.description && (
                  <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">{selectedProject.description}</p>
                )}
                {selectedProject.deadline && (
                  <p className="text-xs text-rose-400 font-bold uppercase tracking-widest mt-3">
                    Submit Deadline: {new Date(selectedProject.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800 mb-4">Student Grade Roster</h3>
                {studentGrades.length === 0 ? (
                  <p className="p-6 text-slate-400 text-sm text-center bg-slate-50 rounded-xl border border-dashed">
                    No students are enrolled to receive marks.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left text-sm min-w-[500px]">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                          <th className="p-4">Student Name</th>
                          <th className="p-4">Marks (Points)</th>
                          <th className="p-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {studentGrades.map(sg => {
                          const currentMarkObj = sg.projectMarks?.find(pm => pm.projectId === selectedProject._id);
                          const currentMark = currentMarkObj ? currentMarkObj.marks : 0;
                          
                          return (
                            <tr key={sg.studentId} className="hover:bg-slate-50/30 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-slate-900">{sg.name}</div>
                                <div className="text-slate-400 text-xs font-mono">{sg.email}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    min="0"
                                    value={currentMark}
                                    onChange={(e) => handleGradeChange(sg.studentId, selectedProject._id, e.target.value)}
                                    className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold" 
                                  />
                                  <span className="text-xs text-slate-400">marks</span>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold border uppercase ${
                                  currentMark > 0 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {currentMark > 0 ? '✓ Graded' : 'Pending'}
                                </span>
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
          ) : (
            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400 font-medium h-full flex flex-col justify-center items-center">
              <span>💼</span>
              <p className="mt-2 text-sm">Please select or assign a project from the inventory panel to manage grading.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CourseProjectsPage;