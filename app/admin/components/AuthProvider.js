// components/AuthProvider.jsx
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function AuthProvider({ children }) {
  const [authStatus, setAuthStatus] = useState('checking');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Public routes that don't require authentication
        const publicRoutes = ['/admin/login', '/admin/register'];
        
        // If on a public route, allow access
        if (publicRoutes.includes(pathname)) {
          setAuthStatus('authenticated');
          return;
        }

        // If no token and not on public route, redirect to login
        if (!token) {
          router.replace('/admin/login');
          setAuthStatus('unauthenticated');
          return;
        }

        // Verify token
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          localStorage.removeItem('token');
          router.replace('/admin/login');
          setAuthStatus('unauthenticated');
          return;
        }

        // If everything checks out
        setAuthStatus('authenticated');
      } catch (error) {
        console.error('Authentication error:', error);
        router.replace('/admin/login');
        setAuthStatus('unauthenticated');
      }
    };

    verifyAuth();
  }, [pathname, router]);

  if (authStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return null; // Don't render anything while redirecting
  }

  return children;
}