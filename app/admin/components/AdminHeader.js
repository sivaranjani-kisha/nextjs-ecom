'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Import useRouter

const AdminHeader = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter(); // Initialize the router

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // Sign out function
  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically call your sign-out API
      // For example, if using NextAuth:
      // const res = await signOut({ redirect: false });
      // For demo purposes, we'll just clear any auth token and redirect
      localStorage.removeItem('authToken'); // Remove if you store tokens
      localStorage.removeItem('token');
      // Redirect to login page
      //router.push('/admin/login');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar-header border-b border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 py-3 px-6 flex items-center justify-between">
      {/* Left side - Sidebar toggle and search */}
      <div className="flex items-center space-x-4">
        {/* Sidebar toggle button */}
        <button onClick={toggleSidebar} className="text-gray-600 dark:text-white focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Right side - Avatar */}
      <div className="profile-dropdown relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center focus:outline-none"
        >
          <div className="w-11 h-11 rounded-full bg-gray-300 dark:bg-neutral-600 overflow-hidden flex items-center justify-center">
            <Image
              src="/admin/assets/images/user.png"
              alt="User Avatar"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-700 rounded-md shadow-lg py-1 z-50">
            <a
              href="#"
              onClick={handleSignOut}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-600"
            >
              Sign out
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;