import Link from "next/link";
import { TiHome } from "react-icons/ti";
import { FaTags, FaLock, FaShoppingCart, FaBlog, FaUser, FaEnvelope, FaBoxOpen } from "react-icons/fa";
import { MdCategory } from "react-icons/md";

const menuItems = [
  { href: "/admin", icon: <TiHome size={24} />, label: "Home" },
  { href: "/admin/category", icon: <MdCategory size={24} />, label: "Category" },
  { href: "/admin/product", icon: <FaBoxOpen size={24} />, label: "Product" },
  { href: "/admin/design", icon: <FaTags size={24} />, label: "Banner" },
  { href: "/admin/order", icon: <FaShoppingCart size={24} />, label: "Order" },
  { href: "/admin/offer", icon: <FaTags size={24} />, label: "Offer" },
  { href: "/admin/blog", icon: <FaBlog size={24} />, label: "Blog" },
  { href: "/admin/user", icon: <FaUser size={24} />, label: "User" },
  { href: "/admin/contact", icon: <FaEnvelope size={24} />, label: "Contact" },
];

export default function AdminSider() {
  return (
    <div className="leftbar-tab z-[99] duration-300 print:hidden">
      <div className="flex w-[60px] bg-white shadow-md dark:bg-slate-800 py-4 items-center fixed top-0 z-[99]
        rounded-[100px] m-4 flex-col h-[calc(100%-30px)]">

        {/* Logo */}
        <a href="/" className="block text-center logo">
          <span>
            <img src="/assets/images/logo-sm.png" alt="logo-small" className="logo-sm h-8" />
          </span>
        </a>

        {/* Sidebar Icons */}
        <div className="icon-body max-h-full w-full">
          <ul className="flex-col w-full items-center mt-[60px] flex-1 space-y-6 relative">
            {menuItems.map((item, index) => (
              <li key={index} className="relative group flex justify-center">
                <Link href={item.href} className="p-0 hover:bg-gray-200 rounded-lg flex items-center justify-center">
                  {item.icon}
                </Link>
                {/* Name */}
                <span className="absolute left-[65px] top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md 
                opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap">
                  {item.label}
                </span>
              </li>
            ))}

            {/* Logout */}
            <li className="relative group flex justify-center">
              <button className="p-3 hover:bg-gray-200 rounded-lg flex items-center justify-center">
                <FaLock size={24} />
              </button>
              <span className="absolute left-[65px] top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md 
              opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap">
                Logout
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
