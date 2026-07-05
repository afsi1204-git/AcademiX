// src/components/StudentNotifications.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await apiClient.get('/notifications/student-alerts');
        setNotifications(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Error fetching notifications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) return <p className="text-slate-400 text-sm text-center py-4">Loading updates...</p>;

  return (
    <div className="space-y-3 p-4">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <span>🔔</span> Classroom Alerts ({notifications.length})
      </h3>
      
      {notifications.length === 0 ? (
        <p className="text-sm text-slate-400 italic bg-white p-4 rounded-xl border border-slate-100 text-center">
          No new notifications from your instructors.
        </p>
      ) : (
        notifications.map((alert) => (
          <div key={alert._id} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:border-blue-100 transition">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-semibold text-slate-800 text-sm">{alert.title}</h4>
              <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                {alert.courseId?.title || 'Course Updates'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">{alert.message}</p>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>By: {alert.instructorId?.name || 'Instructor'}</span>
              <span>{alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : ''}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}