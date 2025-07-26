'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  Info,
  User,
  Gauge,
  Bell,
  ChevronDown,
  Menu,
  LogOut, 
  Receipt,
  FileText,
  PlaneIcon
} from 'lucide-react';

import {
  FaChevronDown,
  FaChevronUp,FaSignOutAlt,FaCubes,
  FaTimes, FaUserPlus, FaSignInAlt,
  FaUserMd,
  FaStethoscope,
  FaVials,
  FaPills,
  FaPlaneDeparture
} from 'react-icons/fa';

import { defaultUser } from '@/assets';

import Button from "@/components/gabriel/Button";
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useUser } from '@/context/UserContext';
import LogoutModal from "@/components/gabriel/LogoutModal";


export default function TopNav({}) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useOutsideClick(dropdownRef, () => setShowDropdown(false));

  const router = useRouter();

  const pathname = usePathname();

  const { user } = useUser() || {}
  const isAuthenticated = !!user;

  const apiUrl = process.env.NEXT_PUBLIC_NODE_BASE_URL;

  const navigate = (location) => {
    if (location === "/login") {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    } else {
      router.push(location);
    }
  };

  const handleLogoutDecision = (choice) => {
    if (choice === "logout") {
      signOut({ callbackUrl: '/login' }); 
    }
  };

  function useOutsideClick(ref, onClose) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          onClose();
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref, onClose]);
  }

  const links = [
    {
      href: "/services/ai",
      label: "Quick Health Checker",
      icon: <FaUserMd size={16} className="text-blue-500" />, // Doctor icon for AI health check
    },
    {
      href: "/services/consult",
      label: "Real-time Medical Consultation",
      icon: <FaStethoscope size={16} className="text-blue-500" />, // Stethoscope for consultation
    },
    {
      href: "/laboratory",
      label: "Laboratory Referral Services",
      icon: <FaVials size={16} className="text-blue-500" />, // Vials for lab services
    },
    {
      href: "/pharmacy",
      label: "Online Pharmacy",
      icon: <FaPills size={16} className="text-blue-500" />, // Pills for pharmacy
    },
    {
      href: "/medical-tourism",
      label: "Medical Tourism",
      icon: <FaPlaneDeparture size={16} className="text-blue-500" />, // Plane for tourism
    },
  ];


  return (
    <header className="bg-white relative top-0 z-50 mb-5">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/logo/logo.png" alt="Logo" width={100} height={70} />
          </Link>
        </div>

        {/* Right: Desktop nav, notification, user */}
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-bold">
            <NavLink href="/" icon={<Home size={18} />} label="Home" active={pathname === "/"} />
            {/* <NavLink href="/about" icon={<Info size={18} />} label="About" active={pathname === "/about"} /> */}
            <NavLink href="/gp-consultation" icon={<User size={18} />} label="GP Services" active={pathname === "/gp-consultation"} />
            <NavLink icon={<FileText size={18} />} href="/cert" label="Cert" active={pathname === "/cart"} />
            {/*<NavLink href="/medical-tourism" icon={<PlaneIcon size={18} />} label="Medical Tourism" active={pathname === "/medical-tourism"} />*/}
            <div className="hidden md:flex items-center ml-6 space-x-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 px-3 py-1.5 border-2 rounded border-[var(--color-primary-7)]">
                  <button
                    onClick={() => router.push("/auth/sign-up?role=specialist")}
                    className="text-[var(--color-primary-7)] hover:text-primary-6 transition-colors duration-200 text-sm font-bold ml-2"
                  >
                    Become Our Doctor
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard dropdown */}
            {/* { isAuthenticated && 
              <NavLink href="/admin" icon={<Gauge size={18} />} label="Dashboard" />
            } */}
          </nav>

          {/* <Bell size={20} className="text-gray-700 hidden md:inline" /> */}
          <div className="hidden md:flex items-center ml-6 space-x-3">
                {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-100"
                  >
                    <img
                      className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                      src={user.profileImage ? `${apiUrl}${user.profileImage}` : defaultUser}
                      alt={user.firstName}
                      crossOrigin="anonymous"
                    />
                    <span className="text-sm text-gray-800 font-medium">{user.firstName}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                      <ul className="py-2">
                        <li>
                          <button
                            onClick={() => {
                              router.push("/admin");
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                          >
                            Dashboard
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setShowLogout(true);
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                          >
                            Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    background="bg-white"
                    textColor="text-[var(--color-primary-6)]"
                    borderRadius="rounded-full"
                    border="border-2 border-primary-6"
                    hoverEffect="hover:bg-[var(--color-primary-6)] hover:text-white transition-colors duration-200"
                    className="text-sm font-medium py-2 px-4"
                    onClick={() => navigate("/login")}
                  >
                    Log In
                  </Button>
                  <Button
                    background="bg-[var(--color-primary-6)]"
                    textColor="text-white"
                    borderRadius="rounded-full"
                    hoverEffect="hover:bg-[var(--color-primary-7)] transition-colors duration-200"
                    className="text-sm font-medium py-2 px-4"
                    onClick={() => navigate("/auth/sign-up")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}

          </div>


          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-50 transform transition-transform duration-500 ease-in-out ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        } shadow-2xl rounded-l-3xl flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/logo/logo.png" alt="Logo" width={90} height={50} />
            </Link>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-10 h-10 rounded-full bg-gray-100 shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-500 transition"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* User Info with Logout on right */}
        <div className="p-6 border-b border-gray-100">
                {isAuthenticated ? (
                  <div className={`
                    flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from[var(--color-primary-6)]/10 to[var(--color-primary-1)]/10
                  `}>
                    <img
                      className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-md"
                      src={user.profileImage ? `${apiUrl}${user.profileImage}` : defaultUser}
                      alt={user.firstName}
                      crossOrigin="anonymous"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-800">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-gray-500 text-sm flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
                        Online
                      </div>
                    </div>
                    <button
                      onClick={() => setShowLogout(true)}
                      className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                    >
                      <FaSignOutAlt />
                    </button>
                  </div>
                ) : (
                  <div className={`
                    flex gap-3
                  `}>
                    <Button
                      background="bg-white"
                      textColor="text-[var(--color-primary-6)]"
                      borderRadius="rounded-xl"
                      border="border-2 border-[var(--color-primary-6)]"
                      hoverEffect="hover:bg-[var(--color-primary-6)] hover:text-white transition-colors duration-200"
                      className="flex-1 text-base py-3 flex items-center justify-center gap-2"
                      onClick={() => {
                        navigate("/login");
                        setMobileOpen(false);
                      }}
                    >
                      <FaSignInAlt /> Log In
                    </Button>
                    <Button
                      background="bg-[var(--color-primary-6)]"
                      textColor="text-white"
                      borderRadius="rounded-xl"
                      hoverEffect="hover:bg-[var(--color-primary-7)] transition-colors duration-200"
                      className="flex-1 text-base py-3 flex items-center justify-center gap-2"
                      onClick={() => {
                        navigate("/auth/sign-up");
                        setMobileOpen(false);
                      }}
                    >
                      <FaUserPlus /> Sign Up
                    </Button>
                  </div>
                )}
              </div>



        {/* Mobile Links */}
        <div className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
          <MobileNavLink icon={<Home size={18} />} href="/" label="Home" active={pathname === "/"} />
          {/*<MobileNavLink icon={<Info size={18} />} href="/medical-tourism" label="Medical Tourism" active={pathname === "/medical-tourism"} /> */}
          
          {/* <MobileNavLink icon={<Info size={18} />} href="/about" label="About" active={pathname === "/about"} /> */}
          <MobileNavLink icon={<User size={18} />} href="/gp-consultation" label="Our GP Services" active={pathname === "/gp-consultation"} />
          <MobileNavLink icon={<FileText size={18} />} href="/cert" label="Cert" active={pathname === "/cert"} />

          <div className="md:flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 px-3 py-1.5 border-2 rounded border-[var(--color-primary-7)]">
                <button
                  onClick={() => router.push("/auth/sign-up?role=specialist")}
                  className="text-[var(--color-primary-7)] hover:text-primary-6 transition-colors duration-200 text-sm font-bold ml-2"
                >
                  Become Our Doctor
                </button>
              </div>
            </div>
          </div>

          { isAuthenticated && 
            <MobileNavLink icon={<Gauge size={18} />} href="/admin" label="Dashboard" />
          }

        </div>

        {/* Footer */}
        <div className="px-4 py-5 text-center text-xs text-gray-400 border-t">
          © 2025 SozoDigiCare
        </div>

        <LogoutModal
          show={showLogout}
          setShow={setShowLogout}
          onDecision={handleLogoutDecision}
        />
      </div>
    </header>
  );
}

// Subcomponents
function NavLink({ href, icon, label, active }) {
  const className = `flex items-center space-x-1 ${
    active
      ? 'text-blue-700 border-b-2 border-blue-700 pb-1'
      : 'text-gray-800 hover:text-blue-700'
  }`;

  if (label === "Dashboard") {
    return (
      <a href={href} className={className}>
        {icon}
        <span>{label}</span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}



function MobileNavLink({ href, label, icon }) {
  const className =
    "flex items-center gap-4 text-gray-800 font-medium px-3 py-3 rounded-lg hover:bg-gray-100 transition";

  if (label === "Dashboard") {
    return (
      <a href={href} className={className}>
        <div className="bg-gray-100 text-blue-600 p-2 rounded-lg">{icon}</div>
        <span className="text-sm">{label}</span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <div className="bg-gray-100 text-blue-600 p-2 rounded-lg">{icon}</div>
      <span className="text-sm">{label}</span>
    </Link>
  );
}



function MobileDropdown({ label, icon, links }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full text-gray-800 font-medium px-3 py-3 rounded-lg ${
          open ? 'bg-slate-200' : 'hover:bg-slate-100'
        } transition-colors duration-300`}
      >
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 text-blue-600 p-2 rounded-lg">
            {icon}
          </div>
          <span className="text-sm">{label}</span>
        </div>
        {open ? (
          <FaChevronUp className="h-3 w-3 text-gray-500" />
        ) : (
          <FaChevronDown className="h-3 w-3 text-gray-500" />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-40 bg-blue-50' : 'max-h-0'
        }`}
      >
        <div className="pl-16 py-2 space-y-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 text-sm py-1"
            >
              <span className="text-blue-500">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      
    </div>
  );
}


