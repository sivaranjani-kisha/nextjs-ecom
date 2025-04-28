"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { FiMail, FiPhone } from "react-icons/fi";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { IoReload, IoStorefront, IoCardOutline, IoShieldCheckmark } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import Image from "next/image";

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [groupedCategories, setGroupedCategories] = useState({ main: [], subs: {} });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories/get");
        const data = await res.json();
        
        if (data) {
          setCategories(data);
          // Group categories immediately after fetching
          const grouped = groupCategories(data);
          setGroupedCategories(grouped);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const groupCategories = (categories) => {
    const grouped = { main: [], subs: {} };
    
    // First find all main categories (where parentid is "none")
    const mainCats = categories.filter(cat => cat.parentid === "none");
    
    // Then find all subcategories for each main category
    mainCats.forEach(mainCat => {
      const subs = categories.filter(cat => cat.parentid === mainCat._id.toString());
      grouped.main.push(mainCat);
      grouped.subs[mainCat._id] = subs;
    });
    
    return grouped;
  };

  const features = [
    { icon: "🚗", title: "Free Shipping", description: "Free shipping all over the US" },
    { icon: "🔒", title: "100% Satisfaction", description: "Guaranteed satisfaction with every order" },
    { icon: "💼", title: "Secure Payments", description: "We ensure secure transactions" },
    { icon: "💬", title: "24/7 Support", description: "We're here to help anytime" },
  ];

  return (
    <>
      {/* Why Choose Us Section */}
      {/* <section style={{ backgroundColor: "#f3f4f6", padding: "40px 0" }}>
  <h2 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", color: "#111827", marginBottom: "24px" }}>
    Why Choose Us?
  </h2>
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",    // allow wrapping if needed
      justifyContent: "center",
      gap: "24px",
      padding: "0 24px",
      maxWidth: "1440px",
      margin: "0 auto",
    }}
  >
    {features.map((feature, index) => (
      <div
        key={index}
        style={{
          display: "flex",
          alignItems: "center",
          flex: "1 1 300px", // allow to shrink and stretch
          maxWidth: "350px",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          backgroundColor: "#cfd4e1",
        }}
      >
        <div
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "12px",
            borderRadius: "9999px",
            fontSize: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {feature.icon}
        </div>
        <div style={{ marginLeft: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginBottom: "8px" }}>
            {feature.title}
          </h3>
          <p style={{ fontSize: "14px", color: "#374151" }}>{feature.description}</p>
        </div>
      </div>
    ))}
  </div>
</section> */}




      {/* Footer Section */}
      <footer className="bg-[#2e2a2a] text-gray-300 text-sm py-10">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-16 justify-between">
            {/* Corporate Office */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-lg mb-4">Corporate Office</h3>
              <p>26/1 Drr. Alagappa Chettiyar Rd, Tatabad, Near Kovai Scan Centre, Coimbatore-641012</p>
              <hr className="border-gray-600 my-3" />
              <div className="flex items-center gap-2">
                <FiPhone /> <span>9842344323</span>
              </div>
              <hr className="border-gray-600 my-3" />
              <div className="flex items-center gap-2">
                <FiMail /> <span>customercare@bharatelectronics.in</span>
              </div>
              <hr className="border-gray-600 my-3" />
              <p><strong>Business Hours:</strong> 09:30AM - 09:30 PM (Mon to Sun)</p>
            </div>

            {/* My Account & Policy */}
            <div className="flex flex-col space-y-6 md:mx-auto">
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">My Account</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="hover:underline hover:text-white">Sign In</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Policy</h3>
                <ul className="space-y-2">
                  <li><Link href="/privacypolicy" className="hover:underline hover:text-white">Privacy Policy</Link></li>
                  <li><Link href="/shipping" className="hover:underline hover:text-white">Shipping Policy</Link></li>
                  <li><Link href="/terms-and-condition" className="hover:underline hover:text-white">Terms and Conditions</Link></li>
                  <li><Link href="/cancellation-refund-policy" className="hover:underline hover:text-white">Cancellation and Refund Policy</Link></li>
                </ul>
              </div>
            </div>

            {/* Company & Social Media */}
            <div className="md:ml-12">
              <div className="mb-8">
                <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="/aboutus" className="hover:underline hover:text-white">About Us</Link></li>
                  <li><Link href="#" className="hover:underline hover:text-white">Contact Us</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <Link href="#"><FaWhatsapp className="text-xl text-green-500" /></Link>
                  <Link href="#"><FaFacebookF className="text-xl text-customBlue" /></Link>
                  <Link href="#"><FaInstagram className="text-xl text-pink-500" /></Link>
                  <Link href="#"><FaYoutube className="text-xl text-red-500" /></Link>
                  <Link href="#"><FaXTwitter className="text-xl text-black-500" /></Link>
                  <Link href="#"><FaLinkedinIn className="text-xl text-customBlue" /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
   {/* Footer Section */}
<div className="bg-[#2e2a2a] text-gray-400 mt-10 pt-10 border-t border-white">
  {/* Top Footer - Info & Downloads */}
  <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 pb-6">
    {/* Left Text */}
    <div className="text-center md:text-left">
      <p>
        <a href="#" className="hover:underline text-white">Bharath Electronics ©</a> 2025 All rights reserved.
      </p>
    </div>

    {/* App Downloads and Payments */}
    <div className="flex flex-col md:flex-row items-center gap-4">
      {/* App Stores */}
      <div className="flex gap-2">
        <img src="https://estore.bharathelectronics.in/assets/images/gplay-img.jpg" alt="Google Play" className="p-1 w-[120px]" />
        <img src="https://estore.bharathelectronics.in/assets/images/app-store-img.jpg" alt="App Store" className="p-1 w-[120px]" />
      </div>
      {/* Payments */}
      <div>
        <img src="https://estore.bharathelectronics.in/assets/images/payments.png" alt="Payment methods" className="p-2 w-[200px]" />
      </div>
    </div>
  </div>

  {/* Bottom Footer - Category Links */}
  <div className="bg-[#2e2a2a] py-6">
    <div className="container mx-auto px-4 text-base font-medium space-y-4">
      {groupedCategories.main.map((mainCat) => (
        <div key={mainCat._id}>
          <Link
            href={`/category/${mainCat.category_slug}`}
            className="font-semibold text-white hover:underline whitespace-nowrap"
          >
            {mainCat.category_name} :
          </Link>
          {groupedCategories.subs[mainCat._id]?.length > 0 && (
            <span className="text-gray-400 ml-2">
              {groupedCategories.subs[mainCat._id].map((subcat, index) => (
                <span key={subcat._id}>
                  <Link
                    href={`/category/${mainCat.category_slug}/${subcat.category_slug}`}
                    className="hover:text-white hover:underline"
                  >
                    {subcat.category_name}
                  </Link>
                  {index < groupedCategories.subs[mainCat._id].length - 1 && ' / '}
                </span>
              ))}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
</div>


      </footer>
    </>
  );
};

export default Footer;