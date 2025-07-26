"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { defaultUser } from '@/assets';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/admin/SidebarContext";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useUser  } from "@/context/UserContext"
import { signOut } from 'next-auth/react';
import {
  Box,
  ChevronDown,
  LayoutGrid,
  MoreHorizontal,
  FileText,
  ShoppingBag,
  FlaskConical,
  Receipt,
  Truck,
  Plane,
  Calendar,
  User,
  Pill,
  Video,
  MessageCircle,
  Image as image,
  Building2,
  Newspaper,
  LogOut,
  Camera,
  MessageSquare 
} from 'lucide-react';

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, toggleMobileSidebar, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState({});
  const subMenuRefs = useRef({});

  const apiUrl = process.env.NEXT_PUBLIC_NODE_BASE_URL

  const [unverifiedLabCount, setUnverifiedLabCount] = useState(0);
  const [unverifiedPharmCount, setUnverifiedPharmCount] = useState(0);
  const [pendingUploadedPrescriptionCount, setPendingUploadedPrescriptionCount] = useState(0);
  const [pendingLinkedPrescriptionCount, setPendingLinkedPrescriptionCount] = useState(0);

  const isActive = useCallback((path) => path === pathname, [pathname]);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const { user } = useUser()
  

  const toggleSubmenu = (key) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleClick = () => {
    if (window.innerWidth < 1024) {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    Object.keys(subMenuRefs.current).forEach((key) => {
      if (subMenuRefs.current[key]) {
        subMenuRefs.current[key].style.height = openSubmenus[key]
          ? `${subMenuRefs.current[key].scrollHeight}px`
          : "0px";
      }
    });
  }, [openSubmenus]);

  useEffect(() => {
    console.log("Session token:", token); // 👈 Add this
  
    if (!token) return; // prevent running fetches without token
  
    // Function to fetch unverified labs - requires either "admin" or "labAdmin" role
  const fetchUnverifiedLabs = async (roles) => {
    try {
      if (roles.some(role => user?.role === role)) {
        const data = await fetchData("laboratories/get-all/no-pagination?status=unverified", token);
        setUnverifiedLabCount(data.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch unverified lab count", err);
    }
  };

  // Function to fetch unverified pharmacies - requires either "admin" or "pharmacyAdmin" role
  const fetchUnverifiedPharmacies = async (roles) => {
    try {
      if (roles.some(role => user?.role === role)) {
        const data = await fetchData("pharmacies/get-all/no-pagination?status=unverified", token);
        setUnverifiedPharmCount(data.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch unverified pharmacy count", err);
    }
  };

  // Function to fetch pending uploaded prescriptions - requires either "admin" or "prescriptionManager" role
  const fetchPendingUploadedPrescription = async (roles) => {
    try {
      if (roles.some(role => user?.role === role)) {
        const data = await fetchData("prescriptions/by/status?status=pending", token);
        setPendingUploadedPrescriptionCount(data.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch pending uploaded prescription count", err);
    }
  };

  // Function to fetch pending linked prescriptions - requires either "admin" or "cartManager" role
  const fetchPendingLinkedPrescription = async (roles) => {
    try {
      if (roles.some(role => user?.role === role)) {
        const data = await fetchData("cart/linked-prescriptions/by/status?status=pending", token);
        setPendingLinkedPrescriptionCount(data.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch pending linked prescription count", err);
    }
  };

  
    fetchUnverifiedLabs(["admin"]); 
    fetchUnverifiedPharmacies(["admin"]); 
    fetchPendingUploadedPrescription(["admin", "pharmacyAdmin", "pharmacyEmployee"]); 
    fetchPendingLinkedPrescription(["admin", "pharmacyAdmin", "pharmacyEmployee"]);

  }, [token]);
  
  
  const handleLogout = () => {
    signOut({
      callbackUrl: '/login', 
    });
  };

  const getNavItems = () => {
    const role = session?.user?.role;

    const filterByRole = (items) => {
      return items
        .filter(item => !item.roles || item.roles.includes(role)) // 👈 Filter based on roles
        .map(item => {
          if (item.subItems) {
            const filteredSub = filterByRole(item.subItems);
            return { ...item, subItems: filteredSub };
          }
          return item;
        })
        .filter(item => !item.subItems || item.subItems.length > 0); // remove empty submenus
    };

    const items =  [
      // dashboard
      {
        icon: <LayoutGrid />,
        name: "Dashboard",
        path: "/admin",
        roles: ["admin", "user", "specialist", "consultant", "superAdmin"]
      },
      // availability
      {
        icon: <User />,
        name: "Specialists",
        path: "/admin/specialists",
        roles: ["admin", "superAdmin"]
      },
      // availability
      {
        icon: <Calendar />,
        name: "Availabilities",
        path: "/admin/availabilities",
        roles: ["specialist", "consultant"]
      },
      // products
      // {
      //   icon: <Box />,
      //   name: "Products",
      //   subItems: [
      //     { name: "All Products", path: "/admin/products" },
      //     { name: "Add Product", path: "/admin/products/add" },
      //     { name: "Brands", path: "/admin/brands" },
      //     { name: "Categories", path: "/admin/categories" },
      //   ],
      //   roles: ["admin", "pharmacyAdmin", "pharmacyEmployee"]
      // },
      // prescriptions
      // {
      //   icon: <FileText />,
      //   name: "Prescriptions",
      //   isUnverified: pendingUploadedPrescriptionCount > 0 || pendingLinkedPrescriptionCount > 0,
      //   subItems: [
      //     {
      //       name: "Uploads",
      //       isUnverified: pendingUploadedPrescriptionCount > 0,
      //       subItems: [
      //         { name: "Pending Approvals", path: "/admin/prescriptions/uploads?status=pending", badge: pendingUploadedPrescriptionCount },
      //         { name: "Approved", path: "/admin/prescriptions/uploads?status=approved" },
      //         { name: "Rejected", path: "/admin/prescriptions/uploads?status=rejected" },
      //       ],
      //     },
      //     {
      //       name: "Linked Prescriptions",
      //       isUnverified: pendingLinkedPrescriptionCount > 0,
      //       subItems: [
      //         { name: "Pending Approvals", path: "/admin/prescriptions/linked?status=pending", badge: pendingLinkedPrescriptionCount,  },
      //         { name: "Approved", path: "/admin/prescriptions/linked?status=approved" },
      //         { name: "Rejected", path: "/admin/prescriptions/linked?status=rejected" },
      //       ],
      //     },
      //   ],
      //   roles: ["admin", "pharmacyAdmin", "pharmacyEmployee", "labAdmin", "labEmployee"]
      // },
      // pharmacy
      // {
      //   icon: <ShoppingBag />,
      //   name: "Pharmacies",
      //   isUnverified: unverifiedPharmCount > 0, 
      //   subItems: [
      //     { name: "My Pharmacy", path: "/admin/pharmacies?my-pharmacy", roles: ["pharmacyAdmin"] },
      //     { name: "Verified", path: "/admin/pharmacies?status=verified", roles: ["admin"] },
      //     { 
      //       name: "Unverified", 
      //       path: "/admin/pharmacies?status=unverified", 
      //       badge: unverifiedPharmCount,
      //       roles: ["admin"]
      //     },
      //   ],
      //   roles: ["admin", "pharmacyAdmin", "user"]
      // },
      // laboratories
      // {
      //   icon: <FlaskConical />,
      //   name: "Laboratories",
      //   isUnverified: unverifiedLabCount > 0,
      //   subItems: [
      //     { name: "Verified", path: "/admin/laboratories?status=verified", roles: ["admin"] },
      //     {
      //       name: "Unverified",
      //       path: "/admin/laboratories?status=unverified",
      //       badge: unverifiedLabCount,
      //       roles: ["admin"]
      //     },
      //     { name: "Services", path: "/admin/laboratories/services", roles: ["labAdmin", "labEmployee", "admin"] },
      //     { name: "Results", path: "/admin/laboratories/results", roles: ["labAdmin", "labEmployee", "admin"] },
      //     // { name: "My Results", path: "/admin/laboratories/my-results", roles: ["user"] },
      //   ],
      //   roles: ["admin"]
      // },
      // orders
      // {
      //   icon: <Box />,
      //   name: "Orders",
      //   subItems: [
      //     // General
      //     { name: "All Orders", path: "/admin/orders" },

      //     // By Category
      //     { name: "Medication Orders", path: "/admin/orders?category=Medication" },
      //     { name: "Lab Service Orders", path: "/admin/orders?category=LabService" },
      
      //     // By Status
      //     { name: "Pending Orders", path: "/admin/orders?status=pending" },
      //     { name: "Paid Orders", path: "/admin/orders?status=paid" },
      //     { name: "Shipped Orders", path: "/admin/orders?status=shipped" },
      //     { name: "Completed Orders", path: "/admin/orders?status=completed" },
      //     { name: "Cancelled Orders", path: "/admin/orders?status=cancelled" },
      
      //     // By Payment Status
      //     { name: "Payment Pending", path: "/admin/orders?paymentStatus=pending" },
      //     { name: "Payment Failed", path: "/admin/orders?paymentStatus=failed" },
      //     { name: "Refunded Orders", path: "/admin/orders?paymentStatus=refunded" }
      //   ],
      //   roles: ["admin", "labAdmin", "labEmployee", "pharmacyAdmin", "pharmacyEmployee", "user"]
      // },
      // shipping addresses
      // {
      //   icon: <Truck />,
      //   name: "Shipping Addresses",
      //   path: "/admin/shipping-addresses" ,
      //   roles: ["admin", "user"]
      // },
      // medical tourisms
      // {
      //   icon: <Plane />,
      //   name: "Medical Tourism",
      //   subItems: [
      //     { name: "Packages", path: "/admin/medical-tourism/packages"},
      //     { name: "Appointments", path: "/admin/medical-tourism/consultations/appointments"},
      //     { name: "Documentations", path: "/admin/medical-tourism/consultations/documentations"}
      //   ],
      //   roles: ["admin", "consultant"]
      // },
      // Appointments
      {
        icon: <Calendar />,
        name: "Appointments",
        path: "/admin/appointments",
        roles: ["admin", "specialist", "user"]
      },
      // Tourism appointment
      // {
      //   icon: <Calendar />,
      //   name: "Tourism Appointments",
      //   path: "/admin/medical-tourism/consultations/appointments",
      //   roles: ["admin"]
      // },
      // Consult Specialist
      {
        icon: <MessageSquare  />,
        name: "Consult Specialist",
        path: "/admin/available-specialists",
        roles: ["user"]
      },
      // Doctor's prescription
      {
        icon: <Pill />,
        name: "Doctor Prescriptions",
        path: "/admin/doctor-prescriptions",
        roles: ["user", "specialist", "admin"]
      },
      // {
      //   icon: <FlaskConical />,
      //   name: "Laboratory Referrals",
      //   path: "/admin/lab-referrals",
      //   roles: ["admin", "superAdmin", "labAdmin", "specialist", "user"]
      // },
      // Call sessions
      {
        icon: <Video />,
        name: "Call Sessions",
        path: "/admin/call-sessions",
        roles: ["user", "specialist", "admin", "superAdmin"]
      },
      // Feedbacks
      {
        icon: <Receipt />,
        name: "Feedbacks",
        path: "/admin/feedbacks",
        roles: ["admin", "superAdmin"]
      },
      // Galleries
      {
        icon: <Camera />,
        name: "Galleries",
        path: "/admin/galleries",
        roles: ["admin", "superAdmin"]
      },
      // Hospitals
      // {
      //   icon: <Building2 />,
      //   name: "Hospitals",
      //   path: "/admin/hospitals",
      //   roles: ["admin"]
      // },
      // Blogs
      {
        icon: <Newspaper />,
        name: "Blogs",
        path: "/admin/blogs",
        roles: ["admin", "superAdmin"]
      }
    ];

    return filterByRole(items);
  };
  

  const renderMenuItems = (items, parentKey = "") => (
    <ul className="flex flex-col">
      {items.map((item, index) => {
        const itemKey = parentKey ? `${parentKey}-${item.name}` : item.name;

        const isOpen = openSubmenus[itemKey];
  
        return (
          <li key={itemKey} className="relative">
            {item.subItems ? (
              <button
                onClick={() => toggleSubmenu(itemKey)}
                className={`menu-item text-lg group font-bold flex items-center w-full ${isOpen ? "menu-item-active" : "menu-item-inactive"}`}
              >
                <span className={`menu-item-icon font-bold ${isOpen 
                  ? 'text-white'
                  : 'text-gray-700' 
                }`}>{item.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{item.name}</span>
                )}

                <span
                  className={`relative right-0 top-0 z-10 h-2 w-2 rounded-full bg-orange-400 ${
                    !item.isUnverified ? "hidden" : "flex"
                  }`}
                >
                  <span className="relative inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
                </span>
                  

                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDown
                    className={`ml-auto w-5 h-5 transition-transform ${isOpen ? "rotate-180 text-white" : ""}`}
                  />
                )}
              </button>
            ) : (
              <Link
                href={item.path}
                className={`menu-item group flex text-lg font-bold items-center ${isActive(item.path) ? "menu-item-active" : "menu-item-inactive"} transition-all duration-300`}
                onClick={handleClick}
              >
                <span className={`menu-item-icon font-bold ${isActive(item.path)
                  ? 'text-white' 
                  : 'text-gray-700'
                }`}>{item.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text flex items-center gap-2">
                    {item.name}
                    {item.badge > 0 && (
                      <span className="bg-amber-500 text-white text-md font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            )}
  
            {item.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => (subMenuRefs.current[itemKey] = el)}
                className="overflow-hidden transition-[height] duration-300 ease-in-out"
                style={{ height: isOpen ? "auto" : "0px"}}
              >
                <ul className="mt-2 ml-5 border-l border-gray-200 dark:border-gray-700">
                  {renderMenuItems(item.subItems, itemKey)}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
  

  return (
    <aside
  className={`fixed top-0 left-0 z-50 h-screen px-5 pt-16 pb-6 bg-white dark:bg-gray-900 dark:border-gray-800 border-r border-gray-200 text-gray-900 transition-all duration-300 flex flex-col
    ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0`}
  onMouseEnter={() => !isExpanded && setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  {/* Logo */}
  <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
    <a href="/">
      <img
        width={100}
        height={32}
        className="dark:hidden"
        src="/images/logo/logo.png"
        alt="Logo"
      />
      <img
        width={100}
        height={32}
        className="hidden dark:block"
        src="/images/logo/logo-dark.png"
        alt="Logo"
      />
    </a>
  </div>

  {/* Main content with scrollable menu and sticky bottom logout */}
  <div className="flex flex-col justify-between flex-grow overflow-hidden">
    {/* Scrollable menu section */}
    <div className="flex flex-col overflow-y-auto no-scrollbar">
      {/* User Info */}
      <div className="flex flex-col items-center p-4 border-b border-gray-200">
        <img
          src={user?.profileImage ? `${apiUrl}${user?.profileImage}` : defaultUser.src}
          crossOrigin="anonymous"
          alt="User"
          className="w-20 h-20 rounded-full mb-2 object-cover"
        />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{user?.firstName}</h2>
      </div>

      {/* Nav Items */}
      <nav className="mb-6">
        <h2
          className={`mb-4 text-md uppercase font-bold flex text-gray-500 ${
            !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
        >
          {isExpanded || isHovered || isMobileOpen ? "" : <MoreHorizontal />}
        </h2>
        {renderMenuItems(getNavItems())}
      </nav>
    </div>

    {/* Logout Button always at bottom */}
    <div className="py-3 border-t border-gray-200 bg-white dark:bg-gray-900 flex justify-center">
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        {(isExpanded || isHovered || isMobileOpen) && <span>Logout</span>}
      </button>
    </div>
  </div>
</aside>


  );
};

export default AppSidebar;
