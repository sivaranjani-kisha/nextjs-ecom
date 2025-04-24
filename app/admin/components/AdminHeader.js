"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For redirecting after logout
  
import { Search, Bell, Moon, ChevronLeft } from "lucide-react";
import Image from "next/image";

export default function TopBar() {
  const [theme, setTheme] = useState("light");
    const [showLogout, setShowLogout] = useState(false);
    const [adminName, setAdminName] = useState("Admin"); // Default name
    const router = useRouter();
  
    // Fetch admin name from local storage or API
    useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setAdminName(user.name || "Admin"); // Default to "Admin" if name is missing
      }
    }, []);
  
    // Logout function
    const handleLogout = () => {
      localStorage.removeItem("token"); // Clear authentication data
      localStorage.removeItem("user"); // Remove user data
      setShowLogout(false);
      router.push("login"); // Redirect to login page
    };
  

  return (
    <div className="fixed ml-24 left-0 right-0 print:hidden z-50 h-16  dark:bg-gray-800 shadow-sm">
      <nav className="px-4 h-full">
        <div className="flex items-center justify-between h-full">
           {/* Menu Toggle Button */}
           <div className="flex items-center gap-4 ml-4">
            <button className="flex rounded-full relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronLeft className="text-3xl text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          {/* Left Section - Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 ml-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Moon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Profile Dropdown */}
                       <div className="relative">
                         <button className="flex items-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                           <Image
                             src="/assets/images/admin-logo-1.jpg"
                             alt="User"
                             width={32}
                             height={32}
                             className="rounded-full"
                           />
                           <span className="hidden xl:block ml-2 text-left">
                             <span className="block font-medium text-gray-600 dark:text-gray-400">
                               {adminName}
                             </span>
                             {/* Clickable Admin Text */}
                             <span
                               role="button"
                               tabIndex="0"
                               onClick={() => setShowLogout(!showLogout)}
                               className="block text-xs text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                             >
                               Admin ▼
                             </span>
                           </span>
                         </button>
           
                         {/* Logout Dropdown */}
                         {showLogout && (
                           <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                             <ul className="py-1">
                               <li>
                                 <button
                                   onClick={handleLogout}
                                   className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900"
                                 >
                                   Sign out
                                 </button>
                               </li>
                             </ul>
                           </div>
                         )}
                       </div>
          </div>
        </div>
      </nav>
    </div>
  );
}