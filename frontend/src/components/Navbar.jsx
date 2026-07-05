import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../services/apiClient';
import { logout } from '../store/slices/authSlice';

const Navbar = ({ setViewMode, currentViewMode }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); 
  const dropdownRef = useRef(null);

  const userPayload = user?.user || user;
  const role = userPayload?.role || 'User';
  const name = userPayload?.name || 'Account';
  const avatarUrl = userPayload?.avatar; 
  const userId = userPayload?._id || userPayload?.id;

  const isInstructor = role === 'instructor' || role === 'teacher';
  const isAdmin = role === 'admin';
  const isStudent = role === 'student' || role === 'user' || (!isAdmin && !isInstructor);

  const [tasks, setTasks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isInstructor) {
      fetchMyTasks();
      const interval = setInterval(fetchMyTasks, 30000); 
      return () => clearInterval(interval);
    }
  }, [isInstructor]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMyTasks = async () => {
    try {
      const res = await apiClient.get('/notifications/my-tasks');
      setTasks(res.data?.data || []);
    } catch (err) {
      console.error('LMS Navbar Task Fetch Error:', err.message);
    }
  };

  const handleMarkAsRead = async (task, e) => {
    e.stopPropagation();
    try {
      await apiClient.post(`/notifications/${task._id}/read`, {});
      
      setTasks(prev => prev.map(t => {
        if (t._id === task._id) {
          if (t.user) {
            return { ...t, isRead: true };
          } else {
            return { ...t, readByUsers: [...(t.readByUsers || []), userId] };
          }
        }
        return t;
      }));
    } catch (err) {
      console.error('Error processing notification acknowledgment flag:', err);
    }
  };

  const isTaskUnread = (task) => {
    if (task.user) {
      return !task.isRead;
    } else {
      return !task.readByUsers?.includes(userId);
    }
  };

  const unreadCount = tasks.filter(isTaskUnread).length;

  const getAvatarLetter = (userName) => {
    if (!userName) return '?';
    return userName.trim().charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 px-6 py-4 font-sans border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        <motion.div 
          onClick={() => {
            if (setViewMode) setViewMode('list');
            navigate('/');
          }} 
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-black text-white shadow-lg shadow-blue-600/20 animate-float-soft">
            A
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">LMS</span>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AcademiX Portal
            </span>
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isInstructor && (
                <div className="relative" ref={dropdownRef}>
                  <motion.button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 rounded-xl hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>🔔</span>
                    <span className="hidden md:inline text-xs text-slate-700">Admin Tasks</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 text-left"
                      >
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Assigned Tasks</span>
                          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">{unreadCount} Pending</span>
                        </div>

                        <motion.div 
                          className="max-h-72 overflow-y-auto divide-y divide-slate-100"
                          variants={{
                            hidden: { opacity: 0 },
                            visible: {
                              opacity: 1,
                              transition: { staggerChildren: 0.05 }
                            }
                          }}
                          initial="hidden"
                          animate="visible"
                        >
                        {tasks.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-6 text-center text-slate-400 text-xs font-medium"
                          >
                            🎉 All clear! No active system directives assigned.
                          </motion.div>
                        ) : (
                          tasks.map((task, index) => {
                            const unread = isTaskUnread(task);
                            return (
                              <motion.div 
                                key={task._id}
                                variants={{
                                  hidden: { opacity: 0, x: -20 },
                                  visible: { opacity: 1, x: 0 }
                                }}
                                className={`p-4 transition-colors flex flex-col gap-1.5 ${unread ? 'bg-blue-50/30' : 'bg-white opacity-60'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800 line-clamp-1">{task.title}</span>
                                  {!task.user && (
                                    <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-wide">
                                      Broadcast
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-500 text-[11px] leading-normal font-medium whitespace-pre-wrap">
                                  {task.message}
                                </p>
                                <div className="w-full flex items-center justify-between text-[9px] text-slate-400 mt-1">
                                  <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                                  {unread && (
                                    <motion.button 
                                      onClick={(e) => handleMarkAsRead(task, e)}
                                      whileHover={{ scale: 1.05 }}
                                      className="text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wide bg-blue-50 hover:bg-blue-100 transition-colors px-2 py-1 rounded-md text-[9px]"
                                    >
                                      ✓ Complete
                                    </motion.button>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {isStudent && (
                <button
                  onClick={() => navigate('/available-courses')}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-xl bg-white shadow-sm transition-all flex items-center gap-2"
                >
                  <span>📖</span> Available Courses
                </button>
              )}

              {isInstructor && location.pathname !== '/instructor/dashboard' && (
                <button
                  onClick={() => navigate('/instructor/dashboard')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>🏫</span> Instructor Dashboard
                </button>
              )}

              {isInstructor && userPayload?.instructorRequestStatus === 'approved' && location.pathname !== '/teacher/dashboard' && (
                <button
                  onClick={() => navigate('/teacher/dashboard')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>👨‍🏫</span> Teacher Panel
                </button>
              )}

              {isAdmin && location.pathname !== '/admin/dashboard' && (
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>⚙️</span> Admin Panel
                </button>
              )}

              {isAdmin && location.pathname !== '/admin/teacher-approvals' && (
                <button
                  onClick={() => navigate('/admin/teacher-approvals')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>✅</span> Teacher Approvals
                </button>
              )}

              {isInstructor && setViewMode && currentViewMode && (
                <>
                  {currentViewMode === 'list' ? (
                    <button
                      onClick={() => setViewMode('create')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <span>➕</span> Create New Course
                    </button>
                  ) : (
                    <button
                      onClick={() => setViewMode('list')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-sm transition-all border border-slate-200"
                    >
                      📋 View Catalog Inventory
                    </button>
                  )}
                </>
              )}

              <div className="flex items-center gap-3 bg-slate-50 pl-2 pr-4 py-1.5 rounded-full border border-slate-200">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={name} 
                    className="w-8 h-8 rounded-full object-cover border border-slate-300" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner tracking-wider">
                    {getAvatarLetter(name)}
                  </div>
                )}
                
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-slate-800 leading-tight">
                    {name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 capitalize leading-none">
                    {role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-600 px-4 py-2 hover:text-blue-600 transition-colors">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                Register
              </button>
            </div>
          )}
        </div>

      </div>
    </motion.nav>
  );
};

export default Navbar;
