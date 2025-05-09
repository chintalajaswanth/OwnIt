import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const year = new Date().getFullYear();

  // Animation variants for footer sections
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
    <motion.footer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-t from-indigo-900 to-gray-900 text-white py-12 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h5 className="text-2xl font-bold text-yellow-300">OwnIt</h5>
            <p className="text-indigo-200 text-sm max-w-xs">
              The ultimate marketplace for real-time auctions, connecting buyers and sellers worldwide.
            </p>
            <div className="flex space-x-4">
              {/* Social Icons (Placeholder) */}
              {['facebook', 'twitter', 'instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-indigo-300 hover:text-yellow-300 transition-colors duration-300"
                >
                  <span className="sr-only">{social}</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    {/* Placeholder SVG path; replace with actual icons */}
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  </svg>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links Section */}
          <motion.div variants={itemVariants}>
            <h5 className="text-xl font-semibold text-white mb-4">Quick Links</h5>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-indigo-200 hover:text-yellow-300 text-sm font-medium transition-colors duration-300 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Section */}
          <motion.div variants={itemVariants}>
            <h5 className="text-xl font-semibold text-white mb-4">Legal</h5>
            <ul className="space-y-2">
              {[
                { to: '/privacy-policy', label: 'Privacy Policy' },
                { to: '/terms-of-service', label: 'Terms of Service' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-indigo-200 hover:text-yellow-300 text-sm font-medium transition-colors duration-300 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.hr
          variants={itemVariants}
          className="my-8 border-t border-indigo-700/50"
        />

        {/* Copyright */}
        <motion.div
          variants={itemVariants}
          className="text-center text-indigo-300 text-sm"
        >
          <p className="mb-0">
            &copy; {year} OwnIt. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;