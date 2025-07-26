import React, { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { defaultUser, logoWhite } from "../assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { PATH } from "../routes/path";
import Button from "./Button";
import { useDispatch, useSelector } from "react-redux";
import { showToast, showModal, hideModal } from "../states/popUpSlice";
import { fetchUserProfile, logout } from "../states/user/authSlice";
import PatientSidebar from "../layouts/PatientSidebar";
import LogoutModal from "./LogoutModal";
import { Notification } from "./index";
import { 
  FaChevronDown, FaChevronUp, FaBars, FaTimes, FaUserCircle, 
  FaHome, FaInfoCircle, FaUserMd, FaCubes, FaTachometerAlt,
  FaSignInAlt, FaUserPlus, FaSignOutAlt, FaBell, FaCalendarAlt,
  FaFileMedical, FaUserInjured, FaClipboardList, FaCog,
  FaVideo, FaComment, FaStethoscope
} from 'react-icons/fa';

const apiUrl = import.meta.env.VITE_API_URL;

const Navbar = ({ className, onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [navMode, setNavMode] = useState("full");
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const openModal = useSelector((state) => state.popUp.modalContent);
  const isDashboard = location.pathname.startsWith(PATH.dashboard.default) || location.pathname.startsWith(PATH.doctor.default);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [mobileMenuTransitionStage, setMobileMenuTransitionStage] = useState(0);
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);
  const [hasSampleNotifications] = useState(true); // Simulate notifications - replace with real data
  const [notificationCount] = useState(3); // Sample notification count - replace with real data

  const isDoctor = user?.role === "specialist";
  const isPatient = user?.role === "user";

  useEffect(() => {
    let menuTimer;
    if (isOpen) {
      setMobileMenuTransitionStage(1);
      menuTimer = setTimeout(() => setMobileMenuTransitionStage(2), 100);
    } else {
      setMobileMenuTransitionStage(0);
    }
    return () => clearTimeout(menuTimer);
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      // Change navbar appearance on scroll
      setScrolled(window.scrollY > 20);
      
      // Make navbar sticky after scrolling past hero section (about 400px)
      setIsSticky(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setNavMode(location.pathname.includes("auth") ? "none" : "full");
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated]);

  const handleLogout = () => {
    dispatch(showModal({ content: "logout" }));
  };

  const NavLink = ({ to, children, hasDropdown, onClick, icon }) => {
    const isActive =
      (to === "/" && location.pathname === "/") ||
      (to !== "/" &&
        location.pathname.startsWith(to) &&
        location.pathname !== "/");
    
    return (
      <Link
        to={to}
        className={`${isActive ? "text-primary-6 font-semibold" : "text-gray-700"
          } hover:text-primary-6 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium flex items-center relative`}
        onMouseEnter={() => hasDropdown && (hasDropdown === "services" ? setIsServicesDropdownOpen(true) : hasDropdown === "dashboard" ? setIsDashboardDropdownOpen(true) : null)}
        onMouseLeave={() => hasDropdown && (hasDropdown === "services" ? setIsServicesDropdownOpen(false) : hasDropdown === "dashboard" ? setIsDashboardDropdownOpen(false) : null)}
        onClick={onClick}
      >
        <span className="relative flex items-center gap-1.5">
          {icon && <span className="text-base">{icon}</span>}
          {children}
          {isActive && (
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-6 rounded-full"></span>
          )}
        </span>
        {hasDropdown && (
          <FaChevronDown className={`ml-1 text-xs transition-transform duration-200 ${
            (hasDropdown === "services" && isServicesDropdownOpen) || 
            (hasDropdown === "dashboard" && isDashboardDropdownOpen) 
              ? 'rotate-180' 
              : 'rotate-0'
          }`} />
        )}
        {hasDropdown && ((hasDropdown === "services" && isServicesDropdownOpen) || (hasDropdown === "dashboard" && isDashboardDropdownOpen)) && (
          <div className="absolute bottom-0 left-0 w-full h-4 bg-transparent" />
        )}
      </Link>
    );
  };

  const ServicesDropdown = () => (
    <div
      className="absolute top-full left-0 mt-1 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black/5 z-10 overflow-hidden transform origin-top transition-all duration-200"
      onMouseEnter={() => setIsServicesDropdownOpen(true)}
      onMouseLeave={() => setIsServicesDropdownOpen(false)}
    >
      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        <Link to={PATH.general.medicalDevices} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-6 transition-colors duration-200" role="menuitem">
          Medical Devices and Equipment
        </Link>
        <Link to={PATH.general.medicalTourism} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-6 transition-colors duration-200" role="menuitem">
          Medical Tourism
        </Link>
        <Link to={PATH.general.laboratoryServices} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-6 transition-colors duration-200" role="menuitem">
          Laboratory Referral Services
        </Link>
      </div>
    </div>
  );

  const DashboardDropdown = () => {
    if (!user) return null;
    
    const links = isDoctor ? [
      { to: PATH.doctor.appointments, label: "My Appointments", icon: <FaCalendarAlt className="mr-2" /> },
      { to: PATH.doctor.patients, label: "My Patients", icon: <FaUserInjured className="mr-2" /> },
      { to: PATH.doctor.consultations, label: "Video Consultations", icon: <FaVideo className="mr-2" /> },
      { to: PATH.doctor.profile, label: "Profile Settings", icon: <FaCog className="mr-2" /> }
    ] : [
      { to: PATH.dashboard.appointments, label: "My Appointments", icon: <FaCalendarAlt className="mr-2" /> },
      { to: PATH.dashboard.records, label: "Medical Records", icon: <FaFileMedical className="mr-2" /> },
      { to: PATH.dashboard.consultations, label: "Consultations", icon: <FaVideo className="mr-2" /> },
      { to: PATH.dashboard.profile, label: "Profile Settings", icon: <FaCog className="mr-2" /> }
    ];
    
    return (
      <div
        className="absolute top-full right-0 mt-1 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black/5 z-10 overflow-hidden transform origin-top transition-all duration-200"
        onMouseEnter={() => setIsDashboardDropdownOpen(true)}
        onMouseLeave={() => setIsDashboardDropdownOpen(false)}
      >
        <div className="py-2 divide-y divide-gray-100">
          <div className="px-4 py-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isDoctor ? "Doctor Dashboard" : "Patient Dashboard"}
            </p>
          </div>
          <div className="py-1">
            {links.map((link, index) => (
              <Link 
                key={index}
                to={link.to} 
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-6 transition-colors duration-200" 
                onClick={() => setIsDashboardDropdownOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const MobileNavLink = ({ to, children, onClick, icon, delay }) => {
    const isActive = location.pathname.startsWith(to) && location.pathname !== "/";
    const animationDelay = delay || 0;
    
    return (
      <Link
        to={to}
        className={`
          flex items-center gap-3 p-4 rounded-2xl text-lg font-medium w-full
          ${isActive ? "bg-primary-6/10 text-primary-6 font-semibold" : "text-gray-700"} 
          hover:bg-primary-6/5 hover:text-primary-6 transition-all duration-300
          transform opacity-0 translate-y-4
          ${mobileMenuTransitionStage === 2 ? `opacity-100 translate-y-0 transition-all duration-500 delay-[${animationDelay}ms]` : ''}
        `}
        onClick={onClick}
        style={{ 
          transitionDelay: `${animationDelay}ms` 
        }}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary-6 text-white' : 'bg-gray-100 text-primary-6'}`}>
          {icon}
        </div>
        <span>{children}</span>
      </Link>
    );
  };

  const MobileDashboardLinks = () => {
    const baseDelay = 350;
    const links = isDoctor ? [
      { to: PATH.doctor.appointments, label: "My Appointments", icon: <FaCalendarAlt className="text-lg" />, delay: baseDelay },
      { to: PATH.doctor.patients, label: "My Patients", icon: <FaUserInjured className="text-lg" />, delay: baseDelay + 50 },
      { to: PATH.doctor.consultations, label: "Video Consultations", icon: <FaVideo className="text-lg" />, delay: baseDelay + 100 }
    ] : [
      { to: PATH.dashboard.appointments, label: "My Appointments", icon: <FaCalendarAlt className="text-lg" />, delay: baseDelay },
      { to: PATH.dashboard.records, label: "Medical Records", icon: <FaFileMedical className="text-lg" />, delay: baseDelay + 50 },
      { to: PATH.dashboard.consultations, label: "Consultations", icon: <FaVideo className="text-lg" />, delay: baseDelay + 100 }
    ];
    
    return (
      <div 
        className={`
          rounded-2xl overflow-hidden transform opacity-0 translate-y-4 mt-3
          ${mobileMenuTransitionStage === 2 ? 'opacity-100 translate-y-0 transition-all duration-500 delay-300' : ''}
          bg-primary-6/5 px-3 py-2
        `}
        style={{ transitionDelay: '300ms' }}
      >
        <div className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">
          {isDoctor ? "Doctor Quick Actions" : "Patient Quick Actions"}
        </div>
        {links.map((link, index) => (
          <MobileNavLink
            key={index}
            to={link.to}
            icon={link.icon}
            delay={link.delay}
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </MobileNavLink>
        ))}
      </div>
    );
  };

  const NotificationsPanel = () => {
    const notifications = useSelector(state => state.notifications.list.slice(0, 3));
    const unreadCount = useSelector(state => state.notifications.unreadCount);
    
    return (
      <div
        className={`
          rounded-2xl overflow-hidden transform opacity-0 translate-y-4 mt-6
          ${mobileMenuTransitionStage === 2 ? 'opacity-100 translate-y-0 transition-all duration-500 delay-500' : ''}
          bg-gray-50 border border-gray-100
        `}
        style={{ transitionDelay: '500ms' }}
      >
        <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
          <span className="font-semibold text-gray-800">Recent Notifications</span>
          <Link to={isDoctor ? PATH.doctor.notifications : PATH.dashboard.notifications} 
            className="text-xs text-primary-6 hover:underline"
            onClick={() => setIsOpen(false)}
          >
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {notifications.length > 0 ? notifications.map(notification => (
            <div key={notification._id} className="p-4 flex gap-3 hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                {notification.type === 'appointment' ? <FaCalendarAlt className="text-blue-500" /> :
                 notification.type === 'message' ? <FaComment className="text-green-500" /> :
                 <FaFileMedical className="text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )) : (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          )}
        </div>
      </div>
    );
  };

  const navbarClasses = `
    bg-white 
    ${scrolled ? 'shadow-md' : 'shadow-sm'} 
    transition-all duration-300 
    ${isSticky ? 'sticky top-0 z-40 animate-slideDown' : ''} 
    ${className}
  `;

  return (
    <>
      {/* Placeholder div that takes up space when navbar becomes sticky */}
      {isSticky && <div className="h-16 invisible"></div>}
      
      <nav className={navbarClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <img src={logoWhite} alt="Logo" className="h-9 w-auto" />
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              {isDashboard ? (
                <button
                  onClick={onMenuClick}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-primary-6 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-5 transition-colors duration-200"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  <FaBars className="h-5 w-5" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  {user && <Notification />}
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                      inline-flex items-center justify-center w-10 h-10 
                      ${isOpen ? 'bg-white text-primary-6 shadow-md' : 'text-gray-500'}
                      rounded-full z-50 transition-all duration-300
                    `}
                    aria-expanded={isOpen}
                  >
                    <span className="sr-only">Open main menu</span>
                    {isOpen ? (
                      <FaTimes className="h-5 w-5" />
                    ) : (
                      <FaBars className="h-5 w-5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center">
              <div className="hidden md:flex items-center space-x-1">
                <NavLink to={PATH.general.home} icon={<FaHome />}>Home</NavLink>
                <NavLink to={PATH.general.about} icon={<FaInfoCircle />}>About</NavLink>
                <NavLink to={PATH.general.doctors} icon={<FaUserMd />}>Doctors</NavLink>
                <div className="relative">
                  <NavLink to={PATH.general.services} hasDropdown="services" icon={<FaCubes />}>Services</NavLink>
                  {isServicesDropdownOpen && <ServicesDropdown />}
                </div>
                {user && (
                  <div className="relative ml-2">
                    <NavLink
                      to={isDoctor ? PATH.doctor.dashboard : PATH.dashboard.default}
                      hasDropdown="dashboard"
                      icon={<FaTachometerAlt />}
                    >
                      Dashboard
                    </NavLink>
                    {isDashboardDropdownOpen && <DashboardDropdown />}
                  </div>
                )}
              </div>

              <div className="hidden md:flex items-center ml-6 space-x-3">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <Notification />
                    
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-100">
                      <div className="relative">
                        <img
                          className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                          src={user.profileImage ? `${apiUrl}${user.profileImage}` : defaultUser}
                          alt={user.firstName}
                          crossOrigin="anonymous"
                        />
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-medium text-sm leading-tight">
                          {user.firstName}
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-primary-6 transition-colors duration-200 text-sm font-medium ml-2"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      background="bg-white"
                      textColor="text-primary-6"
                      borderRadius="rounded-full"
                      border="border-2 border-primary-6"
                      hoverEffect="hover:bg-primary-6 hover:text-white transition-colors duration-200"
                      className="text-sm font-medium py-2 px-4"
                      onClick={() => navigate(PATH.general.loginCrossroad)}
                    >
                      Log In
                    </Button>
                    <Button
                      background="bg-primary-6"
                      textColor="text-white"
                      borderRadius="rounded-full"
                      hoverEffect="hover:bg-primary-7 transition-colors duration-200"
                      className="text-sm font-medium py-2 px-4"
                      onClick={() => navigate(PATH.general.signUp)}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu - Radically improved */}
        <div
          className={`
            fixed inset-0 bg-black/20 backdrop-blur-sm z-40
            transition-all duration-300 pointer-events-none
            ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}
          `}
          onClick={() => setIsOpen(false)}
        >
          <div 
            className={`
              absolute top-0 right-0 bottom-0 w-[85%] max-w-md bg-white shadow-2xl
              transform transition-transform duration-500 ease-in-out
              ${isOpen ? 'translate-x-0' : 'translate-x-full'}
              rounded-l-3xl overflow-hidden
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <img src={logoWhite} alt="Logo" className="h-8 w-auto" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors duration-200"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              {/* User Profile or Login/Signup */}
              <div className="p-6 border-b border-gray-100">
                {user ? (
                  <div className={`
                    flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-primary-6/10 to-primary-1/10
                    transform opacity-0 translate-y-4
                    ${mobileMenuTransitionStage === 2 ? 'opacity-100 translate-y-0 transition-all duration-500' : ''}
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
                      onClick={handleLogout}
                      className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                    >
                      <FaSignOutAlt />
                    </button>
                  </div>
                ) : (
                  <div className={`
                    flex gap-3
                    transform opacity-0 translate-y-4
                    ${mobileMenuTransitionStage === 2 ? 'opacity-100 translate-y-0 transition-all duration-500' : ''}
                  `}>
                    <Button
                      background="bg-white"
                      textColor="text-primary-6"
                      borderRadius="rounded-xl"
                      border="border-2 border-primary-6"
                      hoverEffect="hover:bg-primary-6 hover:text-white transition-colors duration-200"
                      className="flex-1 text-base py-3 flex items-center justify-center gap-2"
                      onClick={() => {
                        navigate(PATH.general.loginCrossroad);
                        setIsOpen(false);
                      }}
                    >
                      <FaSignInAlt /> Log In
                    </Button>
                    <Button
                      background="bg-primary-6"
                      textColor="text-white"
                      borderRadius="rounded-xl"
                      hoverEffect="hover:bg-primary-7 transition-colors duration-200"
                      className="flex-1 text-base py-3 flex items-center justify-center gap-2"
                      onClick={() => {
                        navigate(PATH.general.signUp);
                        setIsOpen(false);
                      }}
                    >
                      <FaUserPlus /> Sign Up
                    </Button>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <MobileNavLink 
                  to={PATH.general.home} 
                  onClick={() => setIsOpen(false)}
                  icon={<FaHome className="text-lg" />}
                  delay={100}
                >
                  Home
                </MobileNavLink>
                
                <MobileNavLink 
                  to={PATH.general.about} 
                  onClick={() => setIsOpen(false)}
                  icon={<FaInfoCircle className="text-lg" />}
                  delay={150}
                >
                  About
                </MobileNavLink>
                
                <MobileNavLink 
                  to={PATH.general.doctors} 
                  onClick={() => setIsOpen(false)}
                  icon={<FaUserMd className="text-lg" />}
                  delay={200}
                >
                  Our Doctors
                </MobileNavLink>

                {/* Services Dropdown */}
                <div 
                  className={`
                    rounded-2xl overflow-hidden transform opacity-0 translate-y-4
                    ${mobileMenuTransitionStage === 2 ? 'opacity-100 translate-y-0 transition-all duration-500 delay-[250ms]' : ''}
                  `}
                  style={{ transitionDelay: '250ms' }}
                >
                  <button
                    className={`
                      flex items-center gap-3 p-4 text-lg font-medium w-full
                      ${isMobileServicesOpen ? 'bg-primary-6/10 text-primary-6 rounded-t-2xl' : 'rounded-2xl text-gray-700 hover:bg-primary-6/5 hover:text-primary-6'} 
                      transition-all duration-300
                    `}
                    onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMobileServicesOpen ? 'bg-primary-6 text-white' : 'bg-gray-100 text-primary-6'}`}>
                      <FaCubes className="text-lg" />
                    </div>
                    <span className="flex-1 text-left">Services</span>
                    {isMobileServicesOpen ? (
                      <FaChevronUp className="text-primary-6" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </button>
                  
                  <div className={`
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${isMobileServicesOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}
                    bg-primary-6/5 rounded-b-2xl
                  `}>
                    <div className="p-4 pl-16 space-y-4">
                      <Link 
                        to={PATH.general.medicalDevices} 
                        className="block py-2 text-gray-700 hover:text-primary-6 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Medical Devices and Equipment
                      </Link>
                      <Link 
                        to={PATH.general.medicalTourism} 
                        className="block py-2 text-gray-700 hover:text-primary-6 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Medical Tourism
                      </Link>
                      <Link 
                        to={PATH.general.laboratoryServices} 
                        className="block py-2 text-gray-700 hover:text-primary-6 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Laboratory Referral Services
                      </Link>
                    </div>
                  </div>
                </div>

                {user && (
                  <>
                    <MobileNavLink
                      to={isDoctor ? PATH.doctor.dashboard : PATH.dashboard.default}
                      onClick={() => setIsOpen(false)}
                      icon={<FaTachometerAlt className="text-lg" />}
                      delay={300}
                    >
                      Dashboard
                    </MobileNavLink>
                    
                    {/* Role-Specific Dashboard Quick Links */}
                    <MobileDashboardLinks />
                    
                    {/* Notifications Panel */}
                    <NotificationsPanel />
                  </>
                )}
              </div>

              {/* Footer */}
              <div 
                className={`
                  p-6 border-t border-gray-100 text-center text-sm text-gray-500
                  transform opacity-0 translate-y-4
                  ${mobileMenuTransitionStage === 2 ? 'opacity-100 translate-y-0 transition-all duration-500 delay-700' : ''}
                `}
                style={{ transitionDelay: '350ms' }}
              >
                <p>© {new Date().getFullYear()} SozoDigiCare</p>
              </div>
            </div>
          </div>
        </div>

        {openModal === "logout" && <LogoutModal />}
      </nav>
    </>
  );
};

export default Navbar;

