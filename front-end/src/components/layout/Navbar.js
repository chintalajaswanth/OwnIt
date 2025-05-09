import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { wallet } = useWallet();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserInitials = (name) => {
    return name?.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  const shouldShowProducts = !user || (user && user.role !== 'bidder');

  return (
    <nav className="bg-indigo-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-white text-2xl font-bold">
              OwnIt
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex space-x-6 text-white font-medium">
              <Link to="/" className="hover:text-indigo-300">Home</Link>
              {shouldShowProducts && (
                <Link to="/products" className="hover:text-indigo-300">Products</Link>
              )}
              <Link to="/auctions" className="hover:text-indigo-300">Auctions</Link>
              <Link to="/communities" className="hover:text-indigo-300">Communities</Link>
              <Link to="/chat" className="hover:text-indigo-300">Chat</Link>
            </div>
          </div>

          {/* Right Side - Auth Links or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/wallet"
                  className="text-white flex items-center hover:text-indigo-300"
                >
                  💰 <span className="ml-1">₹{wallet?.balance.toFixed(2)}</span>
                </Link>

                <div className="relative group">
                  <button className="text-white flex items-center gap-2 hover:text-indigo-300">
                    {user.image ? (
                      <img
                        src={`http://localhost:5000/uploads/${user.image}`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border border-white"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center text-sm font-semibold">
                        {getUserInitials(user.name)}
                      </div>
                    )}
                    <span>{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                    <Link
                      to={`/profile/${user._id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/wallet"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Wallet
                    </Link>
                    {user.role === 'seller' && (
                      <Link
                        to="/products/new"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Add Product
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-indigo-300">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-indigo-600 font-medium px-4 py-1.5 rounded hover:bg-indigo-100 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden space-y-2 pb-4 text-white">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block">Home</Link>
            {shouldShowProducts && (
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block">Products</Link>
            )}
            <Link to="/auctions" onClick={() => setMobileMenuOpen(false)} className="block">Auctions</Link>
            <Link to="/communities" onClick={() => setMobileMenuOpen(false)} className="block">Communities</Link>
            <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className="block">Chat</Link>

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-4">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-white"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center text-sm font-semibold">
                      {getUserInitials(user.name)}
                    </div>
                  )}
                  <span>{user.name}</span>
                </div>
                <Link to="/wallet" onClick={() => setMobileMenuOpen(false)} className="block px-4">
                  Wallet (₹{wallet?.balance.toFixed(2)})
                </Link>
                <Link to={`/profile/${user._id}`} onClick={() => setMobileMenuOpen(false)} className="block px-4">
                  Profile
                </Link>
                {user.role === 'seller' && (
                  <Link to="/products/new" onClick={() => setMobileMenuOpen(false)} className="block px-4">
                    Add Product
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4">
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-4">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
