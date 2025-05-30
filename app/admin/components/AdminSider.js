'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

export default function AdminSider({ collapsed }) {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const router = useRouter();

  const menuItems = [
     { icon: 'material-symbols:category', label: 'Dashboard', link: 'dashboard' },
    { icon: 'material-symbols:category', label: 'Category', link: 'category' },
    {
      icon: 'mdi:package-variant-closed',
      label: 'Product',
      // submenu: [
      //   { icon: 'mdi:format-list-bulleted', label: 'Product List', link: 'product', dotColor: 'bg-green-500' },
      //   { icon: 'mdi:tag-outline', label: 'Brand', link: 'brand', dotColor: 'bg-red-500' },
      //   { icon: 'mdi:upload', label: 'Bulk Upload', link: 'product/bulk_upload', dotColor: 'bg-yellow-500' },
      //    { icon: 'mdi:upload', label: 'Filter Group', link: 'filter_group', dotColor: 'bg-yellow-500' },
      //    { icon: 'mdi:upload', label: 'Filter', link: 'filter', dotColor: 'bg-yellow-500' }
      // ]
      submenu: [
        { icon: 'mdi:format-list-bulleted', label: 'Product List', link: 'product', dotColor: 'bg-green-500' },
        { icon: 'mdi:tag-outline', label: 'Brand', link: 'brand', dotColor: 'bg-red-500' },
        { icon: 'mdi:upload', label: 'Bulk Upload', link: 'product/bulk_upload', dotColor: 'bg-yellow-500' },
        { icon: 'mdi:filter-variant', label: 'Filter Group', link: 'filter_group', dotColor: 'bg-yellow-500' },
        { icon: 'mdi:filter-outline', label: 'Filter', link: 'filter', dotColor: 'bg-yellow-500' }
      ]

    },
    { icon: 'mdi:image-outline', label: 'Banner', link: 'design' },
    {
    icon: 'material-symbols:receipt-long',
    label: 'Order',
    submenu: [
      { icon: 'mdi:clock-outline', label: 'Pending Order', link: 'order/pending-order', dotColor: 'bg-yellow-500' },
      { icon: 'mdi:cancel', label: 'Cancel Order', link: 'order/cancel-order', dotColor: 'bg-red-500' },
      { icon: 'mdi:truck-delivery-outline', label: 'Shipped Order', link: 'order/shipping-order', dotColor: 'bg-green-500' }
    ]
  },
   
    { icon: 'mdi:tag-outline', label: 'Offer', link: 'offer' },
    { icon: 'mdi:note-text-outline', label: 'Blog', link: 'blog' },
    { icon: 'mdi:account-outline', label: 'User', link: 'user' },
    { icon: 'mdi:phone-outline', label: 'Contact', link: 'contact' }
  ];

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 fixed top-0 left-0 shadow z-50 overflow-y-scroll scrollbar-hide transition-all duration-300 ${
    collapsed ? 'w-16' : 'w-52'
  }`}
    >
      <div
        className={`flex items-center px-4 py-4 border-b border-gray-200 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed ? (
          <a href="/" className="flex items-center space-x-2">
            <img src="/admin/assets/images/bea.png" alt="Site Logo" className="h-9" />
            <span className="text-sm font-bold text-gray-700">Bharath Electronics</span>
          </a>
        ) : (
          <img src="/admin/assets/images/bea.png" alt="Site Logo" className="h-9" />
        )}
      </div>

      <nav className="mt-4">
        <ul className="px-2 space-y-1">
          {/* <li className="w-8 text-xs text-gray-500 uppercase tracking-wider">
            {!collapsed && 'Application'}
          </li> */}

          {menuItems.map((item) =>
            item.submenu ? (
              <SidebarItemWithSubmenu
                key={item.label}
                item={item}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                collapsed={collapsed}
                openSubmenu={openSubmenu}
                setOpenSubmenu={setOpenSubmenu}
                router={router}
              />
            ) : (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                link={item.link}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                collapsed={collapsed}
                router={router}
              />
            )
          )}
        </ul>
      </nav>
    </aside>
  );
}

function SidebarItem({ icon, label, link, activeMenu, setActiveMenu, collapsed, router }) {
  const active = activeMenu === label;

  const handleClick = () => {
    setActiveMenu(label);
    router.push(`/admin/${link}`);
  };

  return (
    <li>
      <button
        onClick={handleClick}
        className={`w-full flex items-center px-3 py-3 rounded-lg text-md font-medium transition-colors duration-200
          ${active ? 'bg-blue-500 text-white' : 'text-gray-700 hover:text-blue-500'}
          ${collapsed ? 'justify-center' : 'space-x-3'}`}
      >
        <Icon icon={icon} className={collapsed ? "text-2xl" : "text-xl"} />
        {!collapsed && <span>{label}</span>}
      </button>
    </li>
  );
}

function SidebarItemWithSubmenu({
  item,
  activeMenu,
  setActiveMenu,
  collapsed,
  openSubmenu,
  setOpenSubmenu,
  router
}) {
  const isOpen = openSubmenu === item.label;

  const toggleSubmenu = () => {
    setOpenSubmenu(isOpen ? null : item.label);
  };

  return (
    <li>
      <button
        onClick={toggleSubmenu}
        className={`w-full flex items-center px-3 py-3 rounded-lg text-md font-medium transition-colors duration-200
          ${isOpen ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:text-blue-500'}
          ${collapsed ? 'justify-center' : 'space-x-3'}`}
      >
        <Icon icon={item.icon} className={collapsed ? "text-2xl" : "text-xl"} />
        {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
        {!collapsed && (
          <Icon
            icon={isOpen ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="text-lg"
          />
        )}
        {collapsed && (
          <Icon
            icon={isOpen ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="text-sm ml-1"
          />
        )}
      </button>

      {!collapsed && isOpen && (
        <ul className="ml-6 mt-1 space-y-1">
          {item.submenu.map((subItem) => (
            <li key={subItem.label}>
              <button
                onClick={() => {
                  setActiveMenu(subItem.label);
                  setOpenSubmenu(item.label);
                  router.push(`/admin/${subItem.link}`);
                }}
                className={`w-full flex items-center px-2 py-2 rounded text-sm space-x-3
                  ${
                    activeMenu === subItem.label
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-blue-500'
                  }`}
              >
                {/* Submenu Icon */}
                {subItem.icon && <Icon icon={subItem.icon} className="text-lg" />}
                
                {/* Submenu Label */}
                <span>{subItem.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}