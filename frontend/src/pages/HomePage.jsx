// src/pages/HomePage.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import StaggerContainer from '../components/StaggerContainer';


/**
 * Home page / Landing page with active session auto-redirection matrices
 */
const HomePage = () => {
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Read from Redux store first, then fallback safely to local storage keys
    const activeToken = token || localStorage.getItem('token');
    const storedUserString = localStorage.getItem('user');
    
    let activeUser = user;
    if (!activeUser && storedUserString) {
      try {
        activeUser = JSON.parse(storedUserString);
      } catch (e) {
        console.error("Malformed storage configuration string data blocks:", e);
        activeUser = null;
      }
    }

    // 🚀 AUTO-REDIRECT ACTIVE MATRIX INTERFACES
    if (activeToken && activeUser) {
      const role = activeUser.role;
      const email = activeUser.email?.toLowerCase();

      if (role === 'admin' || email === 'afsi1204@gmail.com') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'instructor') {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        // Routes active logged-in students to their registered path setup
        navigate('/student/my-courses', { replace: true });
      }
    }
  }, [token, user, navigate]);

  const features = [
    {
      icon: '📚',
      title: 'Diverse Courses',
      description: 'Learn from a wide range of expertly-designed courses',
    },
    {
      icon: '👨‍🏫',
      title: 'Expert Instructors',
      description: 'Learn from industry-leading instructors and professionals',
    },
    {
      icon: '📜',
      title: 'Certifications',
      description: 'Earn recognized certificates upon course completion',
    },
    {
      icon: '💼',
      title: 'Career Growth',
      description: 'Boost your career with in-demand skills',
    },
  ];

  return (
    <PageTransition direction="up">
      <div className="w-full">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white py-20"
        >
          <div className="max-w-7xl mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              Welcome to AcademiX
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl md:text-2xl mb-8 opacity-90 selection:bg-indigo-800 selection:text-white"
            >
              Empower your future with world-class education
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center gap-4 flex-wrap"
            >
              <Link
                to="/courses"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition hover-lift"
              >
                Explore Courses
              </Link>
              <Link
                to="/register"
                className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition border border-white hover-lift"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-center text-gray-800 mb-12"
            >
              Why Choose AcademiX?
            </motion.h2>
            <StaggerContainer>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -8 }}
                  className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl mb-4"
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="py-16 px-4 bg-gray-50"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-4xl font-bold text-gray-800 mb-6"
            >
              Ready to start learning?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-xl text-gray-600 mb-8"
            >
              Join thousands of students learning from industry experts
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition inline-block shadow-sm"
              >
                Sign Up Now - It's Free!
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
};

export default HomePage;