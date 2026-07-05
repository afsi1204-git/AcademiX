import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AdminTaskDispatcher = () => {
  const [teachers, setTeachers] = useState([]);
  const [target, setTarget] = useState('all'); 
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await apiClient.get('/notifications/teachers');
      setTeachers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to retrieve teacher list:', err);
    }
  };

  const handleSendTask = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (target === 'individual' && !selectedTeacher) {
      setStatus({ type: 'error', text: 'Please choose an individual teacher.' });
      return;
    }

    try {
      await apiClient.post('/notifications/send-task', {
        target,
        teacherId: target === 'individual' ? selectedTeacher : null,
        title: title.trim() || 'New Administrative Task',
        message: message.trim()
      });

      setStatus({ type: 'success', text: '🚀 Task notification successfully sent!' });
      setMessage('');
      setTitle('');
      setSelectedTeacher('');
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.message || 'Failed to dispatch administrative task.' });
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-2xl shadow-sm p-6 font-sans my-6">
      <h2 className="text-xl font-bold text-slate-800 mb-2">📋 Dispatch Tasks to Teachers</h2>
      <p className="text-xs text-slate-400 mb-6">Assign operational tasks, curriculum edits, or system updates directly to faculty.</p>

      {status.text && (
        <div className={`p-3 rounded-xl text-xs font-bold mb-4 border ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
        }`}>
          {status.text}
        </div>
      )}

      <form onSubmit={handleSendTask} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recipients</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="radio" checked={target === 'all'} onChange={() => setTarget('all')} className="accent-blue-600" />
              All Teachers
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="radio" checked={target === 'individual'} onChange={() => setTarget('individual')} className="accent-blue-600" />
              Individual Teacher
            </label>
          </div>
        </div>

        {target === 'individual' && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Teacher</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Select target instructor --</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Task Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Update Syllabus, Quiz Review"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Task Instructions</label>
          <textarea
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type comprehensive task context and milestones..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.99]"
        >
          Send Task Notification →
        </button>
      </form>
    </div>
  );
};

export default AdminTaskDispatcher;