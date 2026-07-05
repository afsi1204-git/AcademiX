import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getMe } from '../store/slices/authSlice';

/**
 * Hook to get current user from Redux
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (auth.token && !auth.user) {
      dispatch(getMe());
    }
  }, [auth.token, auth.user, dispatch]);

  return {
    user: auth.user,
    token: auth.token,
    loading: auth.loading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    isStudent: auth.user?.role === 'student',
    isInstructor: auth.user?.role === 'instructor',
    isAdmin: auth.user?.role === 'admin',
  };
};

/**
 * Hook to get courses from Redux
 */
export const useCourses = () => {
  const courses = useSelector((state) => state.courses);

  return {
    allCourses: courses.allCourses,
    currentCourse: courses.currentCourse,
    instructorCourses: courses.instructorCourses,
    loading: courses.loading,
    error: courses.error,
    pagination: courses.pagination,
  };
};
