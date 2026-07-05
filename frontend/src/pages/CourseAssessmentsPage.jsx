import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { courseAPI } from '../services/api';

const CourseAssessmentsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);
  const [testWeights, setTestWeights] = useState({ midterm: 40, final: 60 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 🛠️ Wrapped in useCallback to eliminate recreate overhead and quiet the ESLint warning hook rules
  const fetchClassroomDetails = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch course details
      const courseRes = await courseAPI.getCourseById(id);
      setCourse(courseRes.data?.data || courseRes.data);

      // Fetch student grades
      const gradesRes = await apiClient.get(`/courses/${id}/grades`);
      const gradesData = gradesRes.data?.grades || [];
      setStudentGrades(gradesData);

      if (gradesData.length > 0) {
        setTestWeights({
          midterm: gradesData[0].midtermWeight,
          final: gradesData[0].finalWeight
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading classroom details:", err);
      setMessage({ type: 'error', text: 'Failed to retrieve assessment grades.' });
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClassroomDetails();
  }, [fetchClassroomDetails]);

  const calculateFinalScore = (mid, fin) => {
    const score = ((mid * testWeights.midterm) / 100) + ((fin * testWeights.final) / 100);
    return score.toFixed(1);
  };

  const handleGradeMutation = async (studentId, targetField, val) => {
    const numericVal = Number(val) || 0;

    // Local state update first for quick input response
    setStudentGrades(prevGrades => 
      prevGrades.map(sg => {
        if (sg.studentId === studentId) {
          return { ...sg, [targetField]: numericVal };
        }
        return sg;
      })
    );

    // Save back to backend DB
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };

      // Find the student record to get the rest of their values
      const currentStudent = studentGrades.find(sg => sg.studentId === studentId);
      if (!currentStudent) return;

      const payload = {
        studentId,
        midtermRaw: targetField === 'midtermRaw' ? numericVal : currentStudent.midtermRaw,
        finalRaw: targetField === 'finalRaw' ? numericVal : currentStudent.finalRaw,
        midtermWeight: testWeights.midterm,
        finalWeight: testWeights.final
      };

      await apiClient.put(`/courses/${id}/grades`, payload, config);
    } catch (err) {
      console.error("Failed to sync grades to backend:", err);
    }
  };

  const handleWeightChange = async (type, val) => {
    const newWeight = Math.min(Math.max(Number(val) || 0, 0), 100);
    const peerType = type === 'midterm' ? 'final' : 'midterm';
    const peerWeight = 100 - newWeight;

    const freshWeights = {
      [type]: newWeight,
      [peerType]: peerWeight
    };

    setTestWeights(freshWeights);

    // Bulk update weight configuration for all students in the background
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };

      // Trigger parallel backend saves
      await Promise.all(studentGrades.map(sg => 
        apiClient.put(`/courses/${id}/grades`, {
          studentId: sg.studentId,
          midtermRaw: sg.midtermRaw,
          finalRaw: sg.finalRaw,
          midtermWeight: freshWeights.midterm,
          finalWeight: freshWeights.final
        }, config)
      ));
    } catch (err) {
      console.error("Failed to sync updated weights to database:", err);
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
        <button onClick={() => navigate(`/instructor/course/${id}/projects`)} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 whitespace-nowrap">
          💼 Projects Suite
        </button>
        <button className="border-b-2 border-blue-600 px-4 py-2.5 text-sm font-bold text-blue-600 whitespace-nowrap">
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

      {/* Exam weight inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Midterm Exam Weight</span>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={testWeights.midterm} 
              onChange={e => handleWeightChange('midterm', e.target.value)} 
              className="w-20 px-2 py-1 border border-slate-200 font-mono font-bold rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-center" 
            />
            <span className="font-bold text-slate-500">%</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Final Exam Weight</span>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={testWeights.final} 
              onChange={e => handleWeightChange('final', e.target.value)} 
              className="w-20 px-2 py-1 border border-slate-200 font-mono font-bold rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-center" 
            />
            <span className="font-bold text-slate-500">%</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Live Performance Matrix Spreadsheet</h3>
        
        {studentGrades.length === 0 ? (
          <p className="p-6 text-slate-400 text-sm text-center bg-slate-50 rounded-xl border border-dashed">
            No students are currently enrolled to receive scores.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase text-xs">
                <tr>
                  <th className="p-4">Student Identity</th>
                  <th className="p-4">Midterm Score</th>
                  <th className="p-4">Final Score</th>
                  <th className="p-4 text-right">Weighted Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {studentGrades.map(student => (
                  <tr key={student.studentId} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-slate-400 text-xs font-mono">{student.email}</div>
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={student.midtermRaw} 
                        onChange={e => handleGradeMutation(student.studentId, 'midtermRaw', e.target.value)} 
                        className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold" 
                      />
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={student.finalRaw} 
                        onChange={e => handleGradeMutation(student.studentId, 'finalRaw', e.target.value)} 
                        className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold" 
                      />
                    </td>
                    <td className="p-4 text-right font-mono font-black text-blue-600 text-base">
                      {calculateFinalScore(student.midtermRaw, student.finalRaw)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseAssessmentsPage;