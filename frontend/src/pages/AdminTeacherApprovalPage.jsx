import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import apiClient from '../services/apiClient';

const AdminTeacherApprovalPage = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [approvedTeachers, setApprovedTeachers] = useState([]);
  const [rejectedTeachers, setRejectedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTeacherRequests();
  }, []);

  const fetchTeacherRequests = async () => {
    try {
      setLoading(true);

      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        apiClient.get('/admin/pending-teachers'),
        apiClient.get('/admin/approved-teachers'),
        apiClient.get('/admin/rejected-teachers'),
      ]);

      setPendingTeachers(pendingRes.data.data || []);
      setApprovedTeachers(approvedRes.data.data || []);
      setRejectedTeachers(rejectedRes.data.data || []);
    } catch (error) {
      setMessage('Error fetching teacher requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTeacher = async (teacherId) => {
    try {
      setProcessingId(teacherId);

      const response = await apiClient.patch(`/admin/teacher-request/${teacherId}`, { action: 'approve' });

      if (response.data.success) {
        setMessage('Teacher approved successfully!');
        fetchTeacherRequests();
      }
    } catch (error) {
      setMessage('Error approving teacher: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectTeacher = async (teacherId) => {
    try {
      setProcessingId(teacherId);

      const response = await apiClient.patch(`/admin/teacher-request/${teacherId}`, { action: 'reject' });

      if (response.data.success) {
        setMessage('Teacher request rejected successfully!');
        fetchTeacherRequests();
      }
    } catch (error) {
      setMessage('Error rejecting teacher: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const TeacherCard = ({ teacher, showActions = true }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{teacher.name}</h3>
          <p className="text-sm text-gray-600">{teacher.email}</p>
        </div>
        <div>
          {teacher.instructorRequestStatus === 'pending' && (
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
              PENDING
            </span>
          )}
          {teacher.instructorRequestStatus === 'approved' && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              APPROVED
            </span>
          )}
          {teacher.instructorRequestStatus === 'rejected' && (
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
              REJECTED
            </span>
          )}
        </div>
      </div>

      {teacher.bio && (
        <div className="mb-3">
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
            <strong>Bio:</strong> {teacher.bio}
          </p>
        </div>
      )}

      {teacher.expertise && teacher.expertise.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-600 mb-2">EXPERTISE:</p>
          <div className="flex flex-wrap gap-2">
            {teacher.expertise.map((exp, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {exp}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-3">
        Requested on: {new Date(teacher.instructorRequestDate).toLocaleDateString()}
      </div>

      {showActions && teacher.instructorRequestStatus === 'pending' && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleApproveTeacher(teacher._id)}
            disabled={processingId === teacher._id}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-semibold"
          >
            {processingId === teacher._id ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={() => handleRejectTeacher(teacher._id)}
            disabled={processingId === teacher._id}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition font-semibold"
          >
            {processingId === teacher._id ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Teacher Approval Management</h1>
          <p className="text-gray-600 mb-8">Review and approve teacher applications</p>

          {message && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                message.includes('Error')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {message}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-3 px-4 font-semibold border-b-2 transition ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Pending ({pendingTeachers.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`pb-3 px-4 font-semibold border-b-2 transition ${
                activeTab === 'approved'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Approved ({approvedTeachers.length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`pb-3 px-4 font-semibold border-b-2 transition ${
                activeTab === 'rejected'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Rejected ({rejectedTeachers.length})
            </button>
          </div>

          {/* Content */}
          <div>
            {activeTab === 'pending' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Pending Teacher Applications
                </h2>
                {pendingTeachers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending teacher requests</p>
                ) : (
                  pendingTeachers.map((teacher) => (
                    <TeacherCard key={teacher._id} teacher={teacher} showActions={true} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'approved' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Approved Teachers
                </h2>
                {approvedTeachers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No approved teachers yet</p>
                ) : (
                  approvedTeachers.map((teacher) => (
                    <TeacherCard key={teacher._id} teacher={teacher} showActions={false} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'rejected' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Rejected Teachers
                </h2>
                {rejectedTeachers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No rejected teachers</p>
                ) : (
                  rejectedTeachers.map((teacher) => (
                    <TeacherCard key={teacher._id} teacher={teacher} showActions={false} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTeacherApprovalPage;
