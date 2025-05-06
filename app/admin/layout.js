"use client"; // Make it a Client Component

import { usePathname } from "next/navigation";
import AdminHeader from "@/app/admin/components/AdminHeader";
import AdminSider from "@/app/admin/components/AdminSider";
import AuthProvider from '@/app/admin/components/AuthProvider';
export default function AdminLayout({ children }) {
  const pathname = usePathname(); // Get current route

  // Exclude layout for the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
<AuthProvider>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSider />
        <div className="flex-1">
          <AdminHeader />
          <main className="flex-1 p-5 mt-8 ml-14 px-8 h-[calc(100vh-3.5rem)] overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}

