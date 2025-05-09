import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Gavel } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative bg-indigo-900 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620121692029-d088224ddc74')] bg-cover bg-center opacity-20" />
          <div className="relative z-10 px-6 sm:px-12 py-20 text-center">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-yellow-300 tracking-tight drop-shadow-xl"
            >
              Welcome to <span className="text-teal-600">OwnIt</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-4 text-lg sm:text-xl lg:text-2xl text-indigo-200 max-w-3xl mx-auto"
            >
              Experience the thrill of real-time auctions where buyers and sellers connect seamlessly.
            </motion.p>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
            >
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-3 text-lg font-semibold text-indigo-900 bg-white rounded-full shadow-lg hover:bg-teal-600 hover:text-white transition-all duration-300"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-3 text-lg font-semibold text-white border-2 border-white rounded-full hover:bg-white hover:text-indigo-900 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <div className="flex gap-4">
                  <Link
                    to="/auctions"
                    className="inline-flex items-center px-8 py-3 text-lg font-semibold text-white bg-teal-600 rounded-full shadow-lg hover:bg-teal-700 transition-all duration-300"
                  >
                    <Gavel className="w-5 h-5 mr-2" />
                    Browse Auctions
                  </Link>
                  <Link
                    to="/chat"
                    className="inline-flex items-center px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Chat
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              title: 'For Bidders',
              desc: 'Discover exclusive items and secure incredible deals through live bidding.',
              link: user?.role === 'bidder' ? '/auctions' : null,
              linkText: 'Browse Auctions',
            },
            {
              title: 'For Sellers',
              desc: 'Showcase your items to a global audience and maximize your profits.',
              link: user?.role === 'seller' ? '/auctions/new' : null,
              linkText: 'Start Selling',
            },
            {
              title: 'Community',
              desc: 'Join vibrant communities, share interests, and grow your network.',
              link: isAuthenticated ? '/chat' : null,
              linkText: 'Start Chatting',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="relative p-8 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-indigo-100"
            >
              <h2 className="text-2xl font-bold text-indigo-900 mb-4">{feature.title}</h2>
              <p className="text-indigo-600 mb-6">{feature.desc}</p>
              {feature.link && (
                <Link
                  to={feature.link}
                  className="inline-flex items-center px-6 py-2 text-white bg-teal-600 rounded-full hover:bg-teal-700 hover:scale-105 transition-all duration-300"
                >
                  {feature.linkText}
                </Link>
              )}
            </motion.div>
          ))}
        </motion.section>
      </div>
    </div>
  );
};

export default Home;