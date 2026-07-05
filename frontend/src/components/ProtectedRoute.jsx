import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../components/LoadingSpinner'; // Fallback clean loader

const ProtectedRoute = ({ allowedRoles }) => {
  // FIXED: Tied directly into Redux state matching App.jsx architecture
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  // 1. If still checking authentication token, show loading state
  if (loading) {
    return (
      <div style={styles.centered}>
        <div className="text-sm font-bold text-slate-600">Loading your profile parameters...</div>
      </div>
    );
  }

  // 2. If user is completely unauthenticated, bounce them to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userPayload = user?.user || user;
  const currentRole = userPayload?.role || 'user';
  const approvalStatus = userPayload?.instructorRequestStatus || 'none';

  // 3. THE INTERCEPTOR: If user is an instructor but NOT approved by admin yet, lock them here!
  if (currentRole === 'instructor' && approvalStatus !== 'approved') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>⏳</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Application Under Review</h2>
          <p style={{ color: '#475569', fontSize: '0.95rem' }}>Hi <strong>{userPayload?.name || 'Instructor'}</strong>,</p>
          <p style={{ color: '#475569', fontSize: '0.95rem', margin: '10px 0' }}>
            Your instructor account application has been submitted successfully and is 
            currently awaiting review from our administration team.
          </p>
          <p style={styles.subtext}>
            You will gain full access to your course management dashboard as soon as your 
            credentials are verified. Thank you for your patience!
          </p>
          <button onClick={() => window.location.reload()} style={styles.button}>
            Check Status Again
          </button>
        </div>
      </div>
    );
  }

  // 4. If logged in but trying to access a page they don't have roles for
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }

  // 5. Everything checks out perfectly. Render the requested component page.
  return <Outlet />;
};

// Styling Object
const styles = {
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'sans-serif',
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    fontFamily: 'sans-serif',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
  },
  icon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  subtext: {
    color: '#666',
    fontSize: '0.9rem',
    marginTop: '15px',
    lineHeight: '1.5',
  },
  button: {
    marginTop: '25px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default ProtectedRoute;