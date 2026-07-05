import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

/**
 * Admin Dashboard Component managing application approvals, active instructor management,
 * task dispatch notification layers, course inventory catalogs, and accountability system logs.
 */
const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState('catalog'); 
  const [activeTab, setActiveTab] = useState('requests');
  
  // Data States
  const [requests, setRequests] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [courses, setCourses] = useState([]); 
  const [tasks, setTasks] = useState([]); // Added state to track live task completion matrices
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Add Instructor Form State
  const [newInstructor, setNewInstructor] = useState({ name: '', email: '', password: '' });
  const [addingInstructor, setAddingInstructor] = useState(false);

  // Search/Filters
  const [instructorSearch, setInstructorSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Admin Broadcast Task Dispatcher Form States
  const [taskForm, setTaskForm] = useState({ title: '', message: '', targetType: 'all', instructorId: '' });
  const [sendingTask, setSendingTask] = useState(false);

  // Handle Auto-Dismissal Timer Logic for Status Messages
  useEffect(() => {
    if (message.text) {
      const dismissTimer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 4500);

      return () => clearTimeout(dismissTimer);
    }
  }, [message]);

  // Unified data fetcher with custom safe database mapping parameters
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, instRes, courseRes, logsRes, tasksRes] = await Promise.allSettled([
        apiClient.get('/auth/pending-instructors'),
        apiClient.get('/auth/instructors'),
        apiClient.get('/courses'),
        apiClient.get('/auth/logs'),
        apiClient.get('/notifications/send-task') // Pulls down the live tasks track array
      ]);

      if (pendingRes.status === 'fulfilled') setRequests(pendingRes.value.data?.pendingList || pendingRes.value.data || []);
      if (instRes.status === 'fulfilled') setInstructors(instRes.value.data?.instructors || instRes.value.data || []);
      if (logsRes.status === 'fulfilled') setLogs(logsRes.value.data?.logs || logsRes.value.data || []);
      
      // Handle pulling down live task instances safely
      if (tasksRes.status === 'fulfilled') {
        const tData = tasksRes.value.data;
        setTasks(tData?.tasks || tData?.data || (Array.isArray(tData) ? tData : []));
      }

      if (courseRes.status === 'fulfilled') {
        let extractedCourses = [];
        const resData = courseRes.value.data;
        if (resData && Array.isArray(resData.data)) extractedCourses = resData.data;
        else if (Array.isArray(resData)) extractedCourses = resData;
        else if (resData?.courses) extractedCourses = resData.courses;
        setCourses(extractedCourses);
      }

    } catch (err) {
      console.error("Error executing system data synchronization sync lines:", err);
      setMessage({ type: 'error', text: 'Connection latency reading master database clusters.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (id, action) => {
    try {
      await apiClient.put('/auth/approve-instructor', { instructorId: id, action });
      setMessage({ type: 'success', text: `Access request successfully ${action === 'approve' ? 'granted' : 'declined'}!` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Operation failed to commit.' });
    }
  };

  const handleAddInstructor = async (e) => {
    e.preventDefault();
    setAddingInstructor(true);
    setMessage({ type: '', text: '' });
    try {
      await apiClient.post('/auth/add-instructor', newInstructor);
      setMessage({ type: 'success', text: '🎉 Instructor successfully added to the system!' });
      setNewInstructor({ name: '', email: '', password: '' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add instructor.' });
    } finally {
      setAddingInstructor(false);
    }
  };

  const handleRemoveInstructor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to revoke instructor status for ${name}?`)) return;
    try {
      await apiClient.delete(`/auth/remove-instructor/${id}`);
      setMessage({ type: 'success', text: 'Instructor permissions successfully revoked.' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to revoke permissions.' });
    }
  };

  const handleDispatchTask = async (e) => {
    e.preventDefault();
    setSendingTask(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        title: taskForm.title,
        message: taskForm.message,
        target: taskForm.targetType === 'individual' ? 'individual' : 'broadcast',
        teacherId: taskForm.targetType === 'individual' ? taskForm.instructorId : undefined
      };
      await apiClient.post('/notifications/send-task', payload);
      setMessage({ type: 'success', text: '🎯 Instruction notification deployed successfully!' });
      setTaskForm({ title: '', message: '', targetType: 'all', instructorId: '' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to dispatch tasks.' });
    } finally {
      setSendingTask(false);
    }
  };

  const totalRegisteredStudents = courses.reduce((acc, curr) => acc + (curr?.studentsEnrolled?.length || curr?.totalStudents || 0), 0);

  const filteredInstructors = (instructors || []).filter(inst => 
    inst?.name?.toLowerCase().includes(instructorSearch.toLowerCase()) ||
    inst?.email?.toLowerCase().includes(instructorSearch.toLowerCase())
  );

  // Transform system logs array and interleave verified completed tasks automatically
  const processAuditLogs = () => {
    const rawLogs = logs || [];
    const currentTasks = tasks || [];
    
    // 1. Process regular structural logs
    const standardLogs = rawLogs.map(log => ({
      id: log._id || Math.random().toString(),
      instructorName: log.instructor?.name || log.userEmail || 'System Process',
      action: log.action || 'System Process Action Executed',
      details: log.details || log.message || 'No extended descriptor fields found.',
      date: log.createdAt || log.date || new Date().toISOString()
    }));

    // 2. Scan dynamically for completed tasks inside retrieved task documents
    const completedTaskLogs = currentTasks
      .filter(task => task.isCompleted || (Array.isArray(task.completedBy) && task.completedBy.length > 0))
      .flatMap(task => {
        // If your backend tracks individual array updates
        if (Array.isArray(task.completedBy) && task.completedBy.length > 0) {
          return task.completedBy.map(instructor => ({
            id: `task-comp-${task._id}-${instructor._id || instructor}`,
            instructorName: instructor.name || (typeof instructor === 'string' ? instructor : 'Assigned Faculty'),
            action: `✅ Completed Work Assigned: "${task.title || 'Untitled Assignment'}"`,
            details: `Task description context: ${task.message || 'No original directive message attached.'}`,
            date: task.updatedAt || task.createdAt || new Date().toISOString()
          }));
        }
        
        // Single fallback assignment pattern fallback trace
        return [{
          id: `task-single-comp-${task._id}`,
          instructorName: task.teacherId?.name || 'Assigned Instructor',
          action: `✅ Completed Work Assigned: "${task.title || 'Untitled Assignment'}"`,
          details: `Task description context: ${task.message || 'No explicit directive details attached.'}`,
          date: task.updatedAt || new Date().toISOString()
        }];
      });

    // 3. Combine both collections, sort chronologically (Newest first)
    const mergedAuditTrail = [...completedTaskLogs, ...standardLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

    // 4. Run dashboard table lookup search values over everything
    return mergedAuditTrail.filter(log => 
      log.instructorName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase())
    );
  };

  const filteredLogs = processAuditLogs();

  const filteredCatalog = (courses || []).filter(course => 
    course?.title?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    (course?.instructor?.name || 'Unknown Instructor').toLowerCase().includes(catalogSearch.toLowerCase()) ||
    (course?.category || '').toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setViewMode('workspace');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Global Messaging Toaster Banner */}
        {message.text && (
          <div className={`w-full p-4 mb-6 rounded-2xl text-sm font-bold border shadow-sm flex items-center justify-between transition-all ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="text-xs opacity-50 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Workspace Sub-Tab Links Navigation Bar */}
        <div className="flex border-b border-slate-200 mb-8 gap-2 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setViewMode('catalog')}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'catalog' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📈 Analytics Dashboard ({courses?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => switchTab('requests')}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'workspace' && activeTab === 'requests' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📥 Applications Inbox ({requests?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => switchTab('instructors')}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'workspace' && activeTab === 'instructors' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            👥 Manage Instructors ({instructors?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => switchTab('tasks')}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'workspace' && activeTab === 'tasks' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🎯 Send Tasks to Teachers
          </button>
          <button
            type="button"
            onClick={() => switchTab('logs')}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'workspace' && activeTab === 'logs' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Accountability Activity Logs
          </button>
        </div>

        {/* Dynamic Spinner Loading Block */}
        {loading && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm">Querying distributed clusters...</p>
          </div>
        )}

        {/* ----------------- PAGE VIEW 1: COMPLETE CATALOG INVENTORY LINE GRAPH GRID ----------------- */}
        {!loading && viewMode === 'catalog' && (
          <div className="flex flex-col gap-8">
            {/* Analytics Dashboard Metric Counters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Active Catalog Courses</span>
                <h2 className="text-4xl font-black text-blue-600 tracking-tight">{courses?.length || 0} items listed</h2>
              </div>
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Global User Enrollments</span>
                <h2 className="text-4xl font-black text-indigo-600 tracking-tight">{totalRegisteredStudents} users registered</h2>
              </div>
            </div>

            {/* Search filter utility input bar */}
            <div className="flex justify-between items-center flex-wrap gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3 className="text-md font-black text-slate-800">Complete Database Catalogue Inventory</h3>
              </div>
              <input 
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="🔍 Filter catalog by title, track, or instructor..."
                className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs w-full sm:max-w-xs font-medium"
              />
            </div>

            {/* Complete Card Line Graph Grid Workspace Layout */}
            {filteredCatalog.length === 0 ? (
              <p className="py-16 text-slate-400 text-sm text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm font-medium">
                No courses found inside the current catalogue dataset.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCatalog.map((course) => {
                  const count = course?.studentsEnrolled?.length || course?.totalStudents || 0;
                  
                  return (
                    <div key={course._id || Math.random()} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
                      <div>
                        {/* Header Area Layout */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex flex-col gap-1.5">
                            <h4 className="text-lg font-black text-slate-800 tracking-tight">{course.title}</h4>
                            <div>
                              <span className="bg-blue-50 text-blue-600 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-blue-100">
                                {course.category || 'Web Development'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right flex flex-col items-end">
                            <span className="text-2xl font-black text-slate-900 leading-none">{count}</span>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-1">Total Users</span>
                          </div>
                        </div>

                        {/* Complete SVG Line Graph Frame Window Area */}
                        <div className="mt-8 border border-slate-100 rounded-2xl bg-white p-4 relative">
                          <div className="h-28 w-full flex flex-col justify-between relative">
                            
                            {/* Horizontal Line Grid Guidelines */}
                            <div className="w-full border-t border-dashed border-slate-100"></div>
                            <div className="w-full border-t border-dashed border-slate-100"></div>
                            <div className="w-full border-t border-dashed border-slate-100"></div>

                            {/* Actual SVG Line Vector Graph Rendering Layer */}
                            <div className="absolute inset-0 pt-4 pb-2">
                              <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                                <path 
                                  d="M 10 45 Q 150 40 290 30" 
                                  fill="none" 
                                  stroke="#e2e8f0" 
                                  strokeWidth="2" 
                                />
                                <path 
                                  d="M 10 45 Q 150 40 290 30" 
                                  fill="none" 
                                  stroke="#2563eb" 
                                  strokeWidth="2.5" 
                                  strokeLinecap="round"
                                />
                                <circle cx="290" cy="30" r="5" fill="#2563eb" className="animate-pulse" />
                              </svg>
                            </div>
                          </div>

                          {/* Line Graph Time-Axis Footers */}
                          <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            <span>Q1 Launch</span>
                            <span>Mid Term</span>
                            <span className="text-blue-600 font-black">Active Cohorts</span>
                          </div>
                        </div>
                      </div>

                      {/* Utility controls bar on the lower layer */}
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-400">
                        <span>Instructor: <strong className="text-slate-700">{course.instructor?.name || 'Unknown'}</strong></span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">
                            {course.price === 0 || !course.price || course.price === 'FREE' ? 'FREE' : `₹${course.price}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ----------------- PAGE VIEW 2: COMPONENT TAB DATA REGISTRY WORKSPACE ----------------- */}
        {!loading && viewMode === 'workspace' && (
          <>
            {activeTab === 'requests' && (
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden p-6">
                <h3 className="text-lg font-black text-slate-800 mb-4">Instructor Role Access Requests</h3>
                {requests.length === 0 ? (
                  <p className="py-16 text-slate-400 text-sm text-center bg-slate-50 rounded-2xl border border-dashed font-medium">
                    No pending instructor profiles require verification review right now.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-extrabold uppercase tracking-wider border-b border-slate-100">
                          <th className="p-4">Applicant</th>
                          <th className="p-4">Target Expertise</th>
                          <th className="p-4">Bio / Justification</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((user) => (
                          <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50/50 text-sm">
                            <td className="p-4">
                              <div className="font-bold text-slate-800">{user.name}</div>
                              <div className="text-slate-400 text-xs font-mono">{user.email}</div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {user.expertise?.map((exp, idx) => (
                                  <span key={idx} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">{exp}</span>
                                )) || <span className="text-slate-400 text-xs font-normal">Not specified</span>}
                              </div>
                            </td>
                            <td className="p-4 text-slate-600 max-w-sm truncate" title={user.instructorRequestBio}>
                              {user.instructorRequestBio || 'No bio provided'}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => handleAction(user._id, 'approve')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm">Approve</button>
                                <button onClick={() => handleAction(user._id, 'reject')} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-lg">Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'instructors' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col gap-6">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <h3 className="text-lg font-black text-slate-800">Active Classroom Instructors</h3>
                    <input 
                      type="text" 
                      value={instructorSearch}
                      onChange={(e) => setInstructorSearch(e.target.value)}
                      placeholder="🔍 Search name or email..."
                      className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs max-w-xs"
                    />
                  </div>
                  {filteredInstructors.length === 0 ? (
                    <p className="py-12 text-slate-400 text-sm text-center bg-slate-50 rounded-2xl border border-dashed font-medium">No instructors found matching query.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-xs font-extrabold uppercase tracking-wider border-b border-slate-100">
                            <th className="p-4">Instructor Details</th>
                            <th className="p-4">Expertise</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInstructors.map((inst) => (
                            <tr key={inst._id} className="border-b border-slate-100 hover:bg-slate-50/50 text-sm">
                              <td className="p-4">
                                <div className="font-bold text-slate-800">{inst.name}</div>
                                <div className="text-slate-400 text-xs font-mono">{inst.email}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {inst.expertise?.map((exp, idx) => (
                                    <span key={idx} className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">{exp}</span>
                                  )) || <span className="text-slate-400 text-xs">General</span>}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <button onClick={() => handleRemoveInstructor(inst._id, inst.name)} className="text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-bold shadow-sm">Revoke Access</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 h-fit flex flex-col gap-5">
                  <div>
                    <h3 className="text-md font-black text-slate-800">Add New Instructor</h3>
                    <p className="text-slate-400 text-xs mt-1">Directly register an email credentials target block.</p>
                  </div>
                  <form onSubmit={handleAddInstructor} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Full Name</label>
                      <input type="text" value={newInstructor.name} onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" required disabled={addingInstructor} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</label>
                      <input type="email" value={newInstructor.email} onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" required disabled={addingInstructor} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Credentials Password</label>
                      <input type="password" value={newInstructor.password} onChange={(e) => setNewInstructor({ ...newInstructor, password: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" required disabled={addingInstructor} />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm mt-2 transition-all" disabled={addingInstructor}>
                      {addingInstructor ? 'Processing write...' : 'Add Approved Instructor'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 max-w-2xl mx-auto flex flex-col gap-5">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Dispatch Task Directives</h3>
                  <p className="text-slate-400 text-xs mt-1">Issue operational notifications to target staff channels.</p>
                </div>
                <form onSubmit={handleDispatchTask} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Task Header Label</label>
                    <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" required disabled={sendingTask} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Audience Group</label>
                    <div className="flex gap-4 text-sm font-medium text-slate-700 mt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="targetType" value="all" checked={taskForm.targetType === 'all'} onChange={() => setTaskForm({ ...taskForm, targetType: 'all', instructorId: '' })} disabled={sendingTask} /> Broadcast All
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="targetType" value="individual" checked={taskForm.targetType === 'individual'} onChange={() => setTaskForm({ ...taskForm, targetType: 'individual' })} disabled={sendingTask} /> Specific Recipient
                      </label>
                    </div>
                  </div>
                  {taskForm.targetType === 'individual' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Recipient Instructor</label>
                      <select value={taskForm.instructorId} onChange={(e) => setTaskForm({ ...taskForm, instructorId: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white" required disabled={sendingTask}>
                        <option value="">-- Choose Profile From Registry --</option>
                        {instructors.map(i => <option key={i._id} value={i._id}>{i.name} ({i.email})</option>)}
                      </select>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Directive Message</label>
                    <textarea rows="4" value={taskForm.message} onChange={(e) => setTaskForm({ ...taskForm, message: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" required disabled={sendingTask} />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm mt-2" disabled={sendingTask}>
                    {sendingTask ? 'Dispatching data packages...' : '🎯 Deploy Notification Directive'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <h3 className="text-lg font-black text-slate-800">Accountability Audit Trail</h3>
                  <input type="text" value={logSearch} onChange={(e) => setLogSearch(e.target.value)} placeholder="🔍 Search action trails..." className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs max-w-xs" />
                </div>
                {filteredLogs.length === 0 ? (
                  <p className="py-12 text-slate-400 text-sm text-center bg-slate-50 rounded-2xl border border-dashed font-medium">No activity logs recorded.</p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-extrabold uppercase tracking-wider border-b border-slate-100">
                          <th className="p-4">Instructor / Operator</th>
                          <th className="p-4">Action Hook Description</th>
                          <th className="p-4">Extended Context Details</th>
                          <th className="p-4">Runtime Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                        {filteredLogs.map((log) => {
                          const isTaskCompletion = log.action?.includes('✅') || log.action?.toLowerCase().includes('complete');
                          return (
                            <tr key={log.id} className={`hover:bg-slate-50/40 transition ${isTaskCompletion ? 'bg-emerald-50/10' : ''}`}>
                              <td className="p-4">
                                <span className={`font-bold ${isTaskCompletion ? 'text-emerald-700' : 'text-slate-900'}`}>
                                  {log.instructorName}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className={isTaskCompletion ? 'text-emerald-800 font-semibold' : 'text-slate-800'}>
                                    {log.action}
                                  </span>
                                  {isTaskCompletion && (
                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                      Task Log
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-slate-400 text-xs max-w-xs truncate" title={log.details}>
                                {log.details}
                              </td>
                              <td className="p-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                                {log.date ? new Date(log.date).toLocaleString() : 'N/A'}
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
          </>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;