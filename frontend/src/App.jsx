// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { authAPI } from './services/api';
import Navbar from './components/Navbar'; 
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import ApplyCourseForm from './pages/ApplyCourseForm'; 
import StudentDashboard from './pages/StudentDashboard'; 
import AvailableCourses from './pages/AvailableCourses'; 
import InstructorDashboard from './pages/InstructorDashboard'; 
import EditCoursePage from './pages/EditCoursePage';
import LoadingSpinner from './components/LoadingSpinner';
import PageTransition from './components/PageTransition';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminTeacherApprovalPage from './pages/AdminTeacherApprovalPage';

// Instructor Classroom Sub-Suite Components
import CourseStudentsPage from './pages/CourseStudentsPage';
import CourseMaterialsPage from './pages/CourseMaterialsPage';
import CourseAssignmentsPage from './pages/CourseAssignmentsPage';
import CourseAssessmentsPage from './pages/CourseAssessmentsPage';
import CourseProjectsPage from './pages/CourseProjectsPage';
import AdminDashboard from './pages/AdminDashboard';

/**
 * Protected Route component
 * Restricts access based on authentication status, user roles, and approval state.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const [checkingStatus, setCheckingStatus] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const userPayload = user?.user || user;
  const currentRole = userPayload?.role || 'user';
  
  const approvalStatus = userPayload?.instructorRequestStatus || 'none';

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await authAPI.getMe();
      const updatedUser = res.data?.data || res.data?.user || res.data;
      const updatedStatus = updatedUser?.instructorRequestStatus;
      const updatedRole = updatedUser?.role;

      if (updatedStatus === 'approved' || updatedRole === 'instructor') {
        if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
        }
        
        // Sync the updated user object to localStorage so it stays active on subsequent refreshes
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        alert("Verification approved! Synchronizing your instructor console access panels...");
        
        // Hard refresh window context to wipe any stale, cached Redux states instantly
        window.location.reload();
        return;
      } else {
        alert("Your application status is still: " + (updatedStatus || 'pending') + ". Please wait for an administrator to update your profile credentials.");
      }
    } catch (err) {
      console.error('Error syncing verification profiles:', err);
      alert("Could not reach server to update approval records. Try logging out and back in.");
    } finally {
      setCheckingStatus(false);
    }
  };

  if (currentRole === 'instructor' && approvalStatus !== 'approved') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)] bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 text-center border border-slate-100 flex flex-col items-center">
          <div className="text-5xl mb-5 animate-pulse">⏳</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Under Review</h2>
          <p className="text-slate-600 mb-4 text-sm">
            Hi <strong className="text-slate-800">{userPayload?.name || 'Instructor'}</strong>,
          </p>
          <p className="text-slate-500 text-sm mb-5 font-medium leading-relaxed">
            Your instructor account profile has been logged successfully and is currently awaiting evaluation from our administrative oversight team.
          </p>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center mb-6">
            <p className="text-slate-500 text-xs italic leading-relaxed">
              You will receive absolute clearance to access management tools and classrooms as soon as your profile parameters are approved.
            </p>
          </div>
          <button 
            onClick={handleCheckStatus} 
            disabled={checkingStatus}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-sm flex items-center justify-center"
          >
            {checkingStatus ? 'Checking Status...' : 'Check Status Again'}
          </button>
        </div>
      </div>
    );
  }

  if (requiredRole && currentRole !== requiredRole) {
    if (requiredRole === 'student' && currentRole === 'user') {
      return children;
    }
    return <Navigate to="/" />;
  }

  return children;
};

/**
 * Main App component with Darker Grid Accent Splash Screen
 */
function App() {
  const [viewMode, setViewMode] = useState('list');
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const AnimatedRoute = ({ children, direction = 'up' }) => (
    <PageTransition direction={direction}>{children}</PageTransition>
  );

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2200);

    const unmountTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2600); 

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  // Premium Light-Themed Splash View Screen
  if (showSplash) {
    return (
      <div 
        className={`w-full min-h-screen bg-white relative flex flex-col items-center justify-center text-slate-800 select-none overflow-hidden transition-opacity duration-500 ease-in-out ${
          isFadingOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Slightly Darkened Geometric Grid Background Structure (#e2e8f0 border matrices) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none" />

        {/* Dynamic Decorative Soft Glow Blobs */}
        <div className="absolute w-72 h-72 bg-blue-400/10 rounded-full blur-3xl top-1/4 left-1/3 animate-pulse" />
        <div className="absolute w-60 h-60 bg-indigo-400/10 rounded-full blur-3xl bottom-1/4 right-1/3 animate-pulse [animation-delay:1s]" />

        {/* Content Container */}
        <div className="text-center relative z-10 space-y-6">
          
          {/* Logo Brand Animation Block */}
          <div className="flex items-center justify-center space-x-2.5 transform scale-110 animate-slide-up">
            <span className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-2xl shadow-xl shadow-blue-600/15 tracking-wide ring-4 ring-blue-500/5">
              AcademiX
            </span>
          </div>
          
          {/* Tagline text fading sub-indicator */}
          <p className="text-slate-400 text-xs tracking-[0.25em] font-bold uppercase animate-fade-in-delayed">
            Learning Management System
          </p>

          {/* Premium Blue Linear Progress Indicator Bar */}
          <div className="w-36 h-[5px] bg-slate-100 rounded-full mx-auto overflow-hidden relative shadow-inner animate-fade-in-delayed">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full absolute top-0 left-0 w-2/3"
              style={{
                animation: 'luxuryLoadingBar 1.6s infinite cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            ></div>
          </div>
        </div>
        
        {/* Custom CSS Configurations */}
        <style>{`
          @keyframes luxuryLoadingBar {
            0% { transform: translateX(-150%); }
            50% { transform: translateX(-10%); }
            100% { transform: translateX(150%); }
          }
          @keyframes slideUp {
            0% { opacity: 0; transform: translateY(20px) scale(1.05); }
            100% { opacity: 1; transform: translateY(0) scale(1.1); }
          }
          @keyframes fadeInDelayed {
            0% { opacity: 0; }
            40% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-slide-up {
            animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-fade-in-delayed {
            animation: fadeInDelayed 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </div>
    );
  }

  return (
    <BrowserRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.14),transparent_28%)]" />
        <Navbar setViewMode={setViewMode} currentViewMode={viewMode} />
        <main className="relative z-10">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<AnimatedRoute><HomePage /></AnimatedRoute>} />
            <Route path="/login" element={<AnimatedRoute direction="left"><LoginPage /></AnimatedRoute>} />
            <Route path="/auth/login" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<AnimatedRoute direction="right"><RegisterPage /></AnimatedRoute>} />
            <Route path="/auth/register" element={<Navigate to="/register" replace />} />
            <Route path="/courses" element={<AnimatedRoute><CoursesPage /></AnimatedRoute>} />

            {/* Protected routes */}
            <Route path="/courses/:id/apply" element={<ProtectedRoute requiredRole="student"><AnimatedRoute><ApplyCourseForm /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/student/my-courses" element={<ProtectedRoute requiredRole="student"><AnimatedRoute><StudentDashboard /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/available-courses" element={<ProtectedRoute requiredRole="student"><AnimatedRoute><AvailableCourses /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/instructor/dashboard" element={<ProtectedRoute requiredRole="instructor"><AnimatedRoute><InstructorDashboard viewMode={viewMode} setViewMode={setViewMode} /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/instructor/edit-course/:id" element={<ProtectedRoute requiredRole="instructor"><AnimatedRoute><EditCoursePage /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/instructor/course/:id/students" element={<ProtectedRoute requiredRole="instructor"><AnimatedRoute><CourseStudentsPage /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/instructor/course/:id/materials" element={<ProtectedRoute requiredRole="instructor"><AnimatedRoute><CourseMaterialsPage /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/instructor/course/:id/assignments" element={<ProtectedRoute requiredRole="instructor"><AnimatedRoute><CourseAssignmentsPage /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/instructor/course/:id/assessments" element={<ProtectedRoute requiredRole="instructor"><AnimatedRoute><CourseAssessmentsPage /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/instructor/course/:id/projects" element={<ProtectedRoute requiredRole="instructor"><AnimatedRoute><CourseProjectsPage /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/teacher/dashboard" element={<ProtectedRoute requiredRole="instructor"><AnimatedRoute><TeacherDashboard /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AnimatedRoute><AdminDashboard /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/admin/teacher-approvals" element={<ProtectedRoute requiredRole="admin"><AnimatedRoute><AdminTeacherApprovalPage /></AnimatedRoute></ProtectedRoute>} />
            <Route path="*" element={<AnimatedRoute><Navigate to="/" /></AnimatedRoute>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
