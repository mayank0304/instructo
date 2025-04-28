import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from './lib/auth';

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check authentication status when component mounts
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="relative z-40 py-6 px-8 flex justify-between items-center">
      {/* Logo on right */}
      <div className="order-2">
        <Link to="/" className="flex items-center">
          <div className="text-2xl font-bold text-[#f3535b] mr-2">✕</div>
          <span className="text-xl font-semibold bg-gradient-to-r from-[#6766d0] to-[#f3535b] bg-clip-text text-transparent">Platform</span>
        </Link>
      </div>
      
      {/* Navigation Links (Center) */}
      <div className="flex space-x-8 order-1">
        {isLoggedIn && (
          <>
            <Link to="/code" className="text-white hover:text-[#fd8f58] transition-colors duration-300">
              Code Editor
            </Link>
            <Link to="/languages" className="text-white hover:text-[#fd8f58] transition-colors duration-300">
              Languages
            </Link>
            <Link to="/dashboard" className="text-white hover:text-[#fd8f58] transition-colors duration-300">
              Dashboard
            </Link>
          </>
        )}
      </div>
      
      {/* Authentication Button */}
      <div className="order-3">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-[#f3535b] to-[#fd8f58] text-white font-medium shadow-md shadow-[rgba(243,83,91,0.3)] transition-all duration-300 hover:translate-y-[-2px]"
          >
            Logout
          </button>
        ) : (
          <Link 
            to="/sign" 
            className="px-6 py-2 rounded-full bg-gradient-to-r from-[#6766d0] to-[#2c3d95] text-white font-medium shadow-md shadow-[rgba(103,102,208,0.3)] transition-all duration-300 hover:translate-y-[-2px]"
          >
            Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;