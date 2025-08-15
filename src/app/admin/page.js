"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  FaUserAlt, FaCalendarAlt, FaHistory, FaRobot, FaUserMd, 
  FaFileMedical, FaHeartbeat, FaChartLine, FaSearch,
  FaBell, FaClipboardList, FaEllipsisH, FaPills, FaChevronRight,
  FaClock, FaMoneyBill, FaPlus, FaFlask 
} from 'react-icons/fa';

import { useRouter } from "next/navigation";
import { Dialog } from "@headlessui/react";

import { DTable } from "@/components/gabriel";

import MonthlyTarget from "@/components/admin/ecommerce/MonthlyTarget";
import StatisticsChart from "@/components/admin/ecommerce/StatisticsChart";
import RecentOrders from "@/components/admin/ecommerce/RecentOrders";
import DemographicCard from "@/components/admin/ecommerce/DemographicCard";

import { useUser } from "@/context/UserContext";
import { fetchData } from "@/utils/api";

import { triggerChatbotAttention, openChatBot } from "@/store/popUpSlice";
import { useDispatch } from "react-redux";
import RecentTransactions from "@/components/admin/ecommerce/RecentTransactions";

import { setPrice, setSpecialist, setDuration } from '@/store/specialistSlice';
import { CalculatorIcon, CheckCircle, X } from "lucide-react";

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { gpServices } from "@/data/gpServices";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

import ConsultationBookingPageContent from "@/components/BookingPage"
import {
  PricingModal,
  CheckoutModal,
  FindSpecialistModal,
} from "@/components/gabriel";
import ModalContainer from "@/components/gabriel/ModalContainer";

import io from 'socket.io-client';
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);


export default function Ecommerce() {
  const { data: session } = useSession();
  const userRole = session?.user?.role ?? "user";
  const token = session?.user?.jwt

  const dispatch = useDispatch()

  const router = useRouter()

  const { user } = useUser()

  const userId = user?._id

  const PRICE = 20;

  const [calls, setCalls] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentMedications, setRecentMedications] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptions, setPrescriptions] = useState(null)
  const [patients, setPatients] = useState(null)
  const [doctors, setDoctors] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [pharmacies, setPharmacies] = useState(null)
  const [labExists, setLabExists] = useState(false)

  const [isOpen, setIsOpen] = useState(false);

  const [modalContent, setModalContent] = useState(null);
  const [onlineGPs, setOnlineGPs] = useState([]);

  const services = gpServices;

  useEffect(() => {
    socket.emit("get-online-specialists");
    socket.on("update-specialists", (data) => {
        const gpsOnly = data.filter((specialist) => specialist.category === "General Practitioner");
        // console.log(gpsOnly)
        setOnlineGPs(gpsOnly);
    });

    return () => {
      socket.off("update-specialists");
    };
  }, []);

  // Utility function
    const baseDuration = 900; // 15 mins in seconds

    const getPrice = (duration, discountPercent = 0) => {
        const timeRatio = duration / baseDuration;
        const raw = PRICE * timeRatio;
        const discounted = raw - (raw * discountPercent) / 100;
        return Math.round(discounted);
    };

    const getOldPrice = (duration) => {
        const timeRatio = duration / baseDuration;
        const raw = PRICE * timeRatio;
        return Math.round(raw);
    };

  const openDialog = () => {

    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    // setSelectedService(null);
    setModalContent(null);
  };

  const isOnline = onlineGPs[0];

  // Fetch video session statistics
  const fetchSessionData = async () => {
    try {
      const response = await fetchData("video-sessions/by-user/all", token); // Adjust to your actual endpoint
      const sessions = response.sessions;
      // console.log(response.sessions)
      // Prepare data for chart (e.g., sessions count by month)
      const sessionCountsByMonth = Array(12).fill(0);
      const prescriptionCountsByMonth = Array(12).fill(0);
      const sessionPrescriptions = []

      sessions.forEach((session) => {
        const month = new Date(session.createdAt).getMonth(); // Get month from the session date
        sessionCountsByMonth[month]++;

        if (session.prescriptions && session.prescriptions.length > 0) {
          prescriptionCountsByMonth[month]++;
          sessionPrescriptions.push(session.prescriptions)
        }
      });

      // console.log(response.sessions)

      setCalls(response.sessions);
      setLoading(false)
      setPrescriptions(sessionPrescriptions);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };


  useEffect(() => {
    if(token && userRole !== "labAdmin" && userRole !== "pharmacyAdmin") fetchSessionData();
  }, [token]);

  const fetchAppointmentData = async () => {
    if(!user) return
    try {
      let url = ""
      if(userRole === "user"){
        url = `consultation-appointments/all/paginated?patient=${user?._id}&status=pending` 
      }else if( userRole === "specialist" ){
        url = `consultation-appointments/all/paginated?consultant=${user?._id}&status=pending`
      }else{
        url = `consultation-appointments/all/paginated`
      }
      const response = await fetchData(url, token);
      // console.log(response.data)
      setUpcomingAppointments(response.data);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  useEffect(() => {
    const checkLabAdminLab = async () => {
      if (token && userRole === "labAdmin" && userId) {
        try {
          // Get all labs (or ideally you could have a backend endpoint like `laboratories/by-admin/:id`)
          const labs = await fetchData("laboratories/get-all/no-pagination", token);

          // Find one where labAdmin matches current userId
          const existingLab = labs?.labs?.find((lab) => lab.labAdmin === userId);

          if (existingLab) {
            setLabExists(true)
            return;
          }
        } catch (err) {
          console.error("Lab admin lab check failed:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkLabAdminLab();
  }, [token, userRole, userId]);

  const fetchPatients = async () => {
    try {
       const url = `users/get-all/no-pagination`
      const response = await fetchData(url, token);
      // console.log(response)
      setPatients(response);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  }

  const fetchDoctors = async () => {
    try {
      const url = `users/get-all/doctors/no-pagination`
      const response = await fetchData(url, token);
      // console.log(response)
      setDoctors(response);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  }

  const calTotalRevnue = (revenuesObj) => {
    const totalRevenue = revenuesObj?.reduce((sum, payment) => {
      return sum + (payment.amount || 0) / 10;
    }, 0);

    return totalRevenue
  }
 

  const fetchRevenue = async () => {
    try {
      const url = `payments/all/no-pagination`;
      const response = await fetchData(url, token);
      console.log(response.payments);
      setRevenue(response.payments);
  
      // console.log("Total Revenue:", calTotalRevnue(response.payments).toFixed(2));
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };
  

  const fetchPharmacies = async () => {
    try {
      const url = `pharmacies/get-all/no-pagination`
      const response = await fetchData(url, token);
      // console.log(response)
      setPharmacies(response);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
    
  }

  useEffect(() => {
    if (userRole === "admin" || userRole === "superAdmin") {
      fetchPatients();
      fetchDoctors();
      fetchPharmacies();
      fetchRevenue();
    }
  }, [userRole]);

  // Simulated fetch
  useEffect(() => {

    if(token) fetchAppointmentData()

    setRecentMedications(prescriptions);
    setRecordsCount(prescriptions?.length);

    const latestDate = prescriptions?.reduce((latest, current) => {
      const currentStart = new Date(current.startDate);
      return currentStart > latest ? currentStart : latest;
    }, new Date(0));
    setLastUpdated(latestDate);
  }, [prescriptions, token]);

  const formatLastUpdated = (date) => {
    if (!date) return "No data";
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleChat = () => {
      dispatch(triggerChatbotAttention());
      dispatch(openChatBot(true));
  };

  const handleConsult = () => {
    router.push("admin/available-specialists")
  };

  const handleConsultGP = () => {
    if (isOnline) {
      const specialist = onlineGPs[0];
      dispatch(setSpecialist(specialist));
      setModalContent("pricingModal");
      setIsOpen(true);
    } else {
      openDialog();
    }
  };

  const handleMedicalRecords = () => {};

  const handleAppointments = () => {
    router.push("admin/appointments")
  };
  const handleCreateAppointments = () => {
    router.push("admin/consultation/book")
  };
  const handleHistory = () => {};

  const handleCreateLab = () => {
    router.push("admin/laboratories/add")
  };

  const handleAvailability = () => {
    router.push("admin/availabilities")
  }

  const handleLabDashboard = () => {

  }

  const handlePrescriptions = () => {

  }

  const handleEarnings = () => {

  }

  const handlePatients = () => {

  }

  const handleDoctors = () => {

  }

  const handlePharmacies = () => {

  }

  const handleRevenues = () => {

  }

  const handleConsultations = () => {

  }

  const quickActions = [
    // {
    //   title: "Symptoms Checker",
    //   description: "Get instant health advice",
    //   icon: <FaRobot className="text-cyan-500" size={20} />,
    //   bgColor: "bg-cyan-50",
    //   borderColor: "border-cyan-200",
    //   action: handleChat
    // },
    {
      title: "Consult GP Doctor",
      description: "General practice consult",
      icon: <FaUserMd className="text-red-400" size={20} />,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      action: handleConsultGP
    },
    {
      title: "Consult Specialist",
      description: "Book a consultation",
      icon: <FaUserMd className="text-indigo-500" size={20} />,
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      action: handleConsult
    },
    // {
    //   title: "Medical Records",
    //   description: "View your records",
    //   icon: <FaFileMedical className="text-blue-600" size={20} />,
    //   bgColor: "bg-blue-50",
    //   borderColor: "border-blue-200",
    //   action: handleMedicalRecords
    // },
    {
      title: "Appointments",
      description: "Manage appointments",
      icon: <FaCalendarAlt className="text-green-600" size={20} />,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      action: handleAppointments
    }
  ];

  // Dynamic stats based on real data
  const stats = [
    {
      title: "Next Appointment",
      value: upcomingAppointments.length > 0 ? 
        new Date(upcomingAppointments[0].date).toLocaleDateString() : 
        "None",
      change: upcomingAppointments.length > 0 ? 
        `with ${ userRole === "user" ? 'Dr.'+ upcomingAppointments[0].consultant?.firstName || 'Specialist' : upcomingAppointments[0].patient?.firstName}` : 
        "No scheduled appointments",
      icon: <FaCalendarAlt className="text-green-600" size={20} />,
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      visible: userRole === "user" || userRole === "specialist",
      action: handleAppointments
    },
    {
      title: "Medical Records",
      value: recordsCount?.toString(),
      change: lastUpdated ? `Last updated ${formatLastUpdated(lastUpdated)}` : "No records yet",
      icon: <FaFileMedical className="text-blue-600" size={20} />,
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      visible: userRole === "specialist",
      action: handleMedicalRecords
    },
    {
      title: "Prescriptions",
      value: prescriptions?.length?.toString(),
      change: prescriptions?.length > 0 ? 
        `${prescriptions?.filter(med => med.remainingDays < 10).length} need${prescriptions?.filter(med => med.remainingDays < 10).length === 1 ? 's' : ''} refill soon` : 
        "No active prescriptions",
      icon: <FaPills className="text-purple-600" size={20} />,
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      visible: userRole === "user",
      action: handlePrescriptions
    },
    {
      title: "Consultations",
      value: calls.length.toString(),
      change: calls.length > 0 ? 
        `Last: ${new Date(calls[calls.length-1].endTime).toLocaleDateString()}` : 
        "No past consultations",
      icon: <FaUserMd className="text-red-600" size={20} />,
      bgColor: "bg-red-50",
      iconBg: "bg-red-100",
      visible: userRole === "user" || userRole === "specialist",
      action: handleConsultations
    },
    {
      title: "Earning",
      value: `$${calls.reduce((total, call) => total + (call.appointment?.price || 0) * 2, 0)}`,
      change: calls.length > 0
        ? `Last: $${(calls[calls.length - 1].durationInMinutes || 0) * 2}`
        : "No past earning",
      icon: <FaMoneyBill className="text-blue-600" size={20} />,
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      visible: userRole === "specialist",
      action: handleEarnings
    },

    {
      title: "Patients",
      value: patients?.length?.toString(),
      change: patients?.length > 0
        ? `Latest: ${patients[patients?.length - 1].firstName || 'Patient'}`
        : "No patients found",
      icon: <FaUserAlt className="text-green-600" size={20} />,
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      visible: userRole === "admin" || userRole === "superAdmin",
      action: handlePatients
    },
    {
      title: "Doctors",
      value: doctors?.length.toString(),
      change: doctors?.length > 0
        ? `${doctors?.filter(doc => doc?.approvalStatus === "pending").length} pending approval(s)`
        : "No active pharmacies",
      icon: <FaUserMd className="text-blue-600" size={20} />,
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      visible: userRole === "admin" || userRole === "superAdmin",
      action: handleDoctors
    },
    {
      title: "Pharmacies",
      value: pharmacies?.length?.toString(),
      change: pharmacies?.length > 0
        ? `${pharmacies?.filter(pharm => pharm?.status === "unverified").length} pending approval(s)`
        : "No active pharmacies",
      icon: <FaPills className="text-purple-600" size={20} />,
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      visible: userRole === "admin" || userRole === "superAdmin",
      action: handlePharmacies
    },
    {
      title: "Revenue",
      value: `$${revenue ? calTotalRevnue(revenue)?.toFixed(2) : 'loading...'}`,
      change: calls.length > 0
        ? `Last: ${revenue ? new Date(revenue[0].created * 1000).toLocaleDateString() : 'loading...'}`
        : "No past payments",
      icon: <FaMoneyBill className="text-red-600" size={20} />,
      bgColor: "bg-red-50",
      iconBg: "bg-red-100",
      visible: userRole === "admin" || userRole === "superAdmin",
      action: handleRevenues
    }
  ];

  
  

  return (
    <div className="min-h-screen border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        { userRole === "user" && 
          <div className="mb-8 bg-gradient-to-r from-[var(--color-primary-6)] to-[var(--color-primary-8)] rounded-2xl shadow-md">
            <div className="p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {user?.firstName || 'User'}</h2>
                  <p className="mt-1 opacity-90">Your health matters to us. How can we help you today?</p>
                  { !user?.firstName  || !user?.lastName && (
                    <p className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      Please complete your profile
                    </p>
                  )}
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <button 
                    onClick={handleCreateAppointments}
                    className="bg-white text-[var(--color-primary-7)] px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center"
                  >
                    <CalculatorIcon className="mr-2" />
                    Book an Appointment 
                  </button>
                  <button 
                    onClick={handleConsultGP}
                    className="bg-white/20 text-white border border-white/40 px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-white/30 transition-all flex items-center"
                  >
                    <FaUserMd className="mr-2" />
                    Consult GP now
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

        { userRole === "specialist" && 
          <div className="mb-8 bg-gradient-to-r from-[var(--color-primary-6)] to-[var(--color-primary-8)] rounded-2xl shadow-md">
            <div className="p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, Dr. {user?.firstName || 'User'}</h2>
                  { userRole === "user" && <p className="mt-1 opacity-90">Your health matters to us. How can we help you today?</p>}
                  { userRole === "specialist" && 
                    <p className="mt-1 opacity-90">
                      Ready for another day of making a difference? Let’s help your patients feel better, one consultation at a time.
                    </p> 
                  }

                  { !user?.firstName  || !user?.lastName && (
                    <p className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      Please complete your profile
                    </p>
                  )}
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <button 
                    onClick={handleAppointments}
                    className="bg-white text-[var(--color-primary-7)] px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Appointments
                  </button>
                  <button 
                    onClick={handleAvailability}
                    className="bg-white/20 text-white border border-white/40 px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-white/30 transition-all flex items-center"
                  >
                    <FaClock className="mr-2" />
                    Availability
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

        {userRole === "labAdmin" && (
          <div className="mb-8 bg-gradient-to-r from-[var(--color-primary-6)] to-[var(--color-primary-8)] rounded-2xl shadow-md">
            <div className="p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
                  </h2>
                  {labExists ? (
                    <p className="mt-1 opacity-90">
                      You're all set. Manage your laboratory activities and referrals below.
                    </p>
                  ) : (
                    <p className="mt-1 opacity-90 text-yellow-200">
                      You don't have a laboratory yet. Please create one to start receiving patient referrals.
                    </p>
                  )}
                </div>

                <div className="mt-4 md:mt-0 flex space-x-3">
                  {labExists ? (
                    <>
                      <button 
                        onClick={handleLabDashboard}
                        className="bg-white text-[var(--color-primary-7)] px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center"
                      >
                        <FaFlask className="mr-2" />
                        Manage Lab
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleCreateLab}
                      className="bg-white/20 text-white border border-white/40 px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-white/30 transition-all flex items-center"
                    >
                      <FaPlus className="mr-2" />
                      Create Laboratory
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} ${!stat.visible ? 'hidden' : ''} rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.iconBg} w-10 h-10 rounded-full flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                  <div className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    {/* <FaEllipsisH size={16} /> */}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-xs mt-2 text-gray-500">{stat.change}</p>
              </div>
            </div>
          ))}
        </div>

        

        {/* Existing eCommerce Grid Layout */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
        {(userRole === "admin" || userRole === "superAdmin") &&
          <>
              <div className="col-span-6">
                <MonthlyTarget />
              </div>

              
                <div className="col-span-6">
                  <StatisticsChart />
                </div>
            </>
          }

          { userRole === "user" && 
            <div className="col-span-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4">
                  {quickActions.map((action, index) => (
                    <div 
                      key={index} 
                      onClick={action.action}
                      className={`${action.bgColor} border ${action.borderColor} dark:bg-gray-800 dark:border-gray-700 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md flex items-center justify-between`}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-100 flex items-center justify-center shadow-sm mr-4">
                          {action.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-gray-100">{action.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
                        </div>
                      </div>
                      <FaChevronRight className="text-gray-400 dark:text-gray-500" />
                    </div>
                  ))}
                </div>
              </div>
          
              {/* Upcoming Appointments */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="border-b dark:border-gray-700 px-5 py-4 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-100">Upcoming Appointments</h2>
                  <button
                    onClick={handleAppointments}
                    className="text-[var(--color-primary67)] hover:text-[var(--color-primary-7)] text-xs font-medium"
                  >
                    View All
                  </button>
                </div>
          
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {upcomingAppointments.length > 0 ? upcomingAppointments.map((appointment, index) => (
                    <div key={index}>
                      { (appointment.status === "pending" && appointment.mode !== "now" && index < 5) &&
                        <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center">
                            {appointment.avatar ? (
                              <img 
                                src={appointment.avatar} 
                                alt={appointment.doctorName} 
                                className="w-10 h-10 rounded-full mr-4 object-cover border border-gray-200 dark:border-gray-700"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full mr-4 bg-primary-100 text-primary-700 dark:bg-primary-200 dark:text-primary-900 flex items-center justify-center font-bold">
                                {appointment.doctorName?.charAt(0) || 'D'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{appointment.consultant.firstName || 'Doctor'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{appointment.consultant.specialty || 'Specialist'}</p>
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span className="text-[var(--color-primary67)] mr-1">
                                  <FaCalendarAlt size={10} />
                                </span>
                                <span>
                                  {appointment.date ? (
                                    typeof appointment.date === 'string' && !appointment.date.includes('-') ? 
                                    appointment.date : 
                                    new Date(appointment.date).toLocaleDateString()
                                  ) : 'Date not set'}, 
                                  {appointment.time || (appointment.startTime ? new Date(appointment.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '00:00')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <button 
                                onClick={() => router.push(`${PATH.dashboard.appointments}/${appointment.id || appointment._id}`)}
                                className="px-3 py-1 bg-primary-50 text-[var(--color-primary67)] rounded-full text-xs font-medium hover:bg-primary-100 transition-colors"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  )) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No upcoming appointments</p>
                      <button 
                        onClick={handleAppointments}
                        className="mt-2 px-4 py-2 bg-primary-50 text-[var(--color-primary67)] rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  )}
                </div>
          
                <div className="p-4 bg-gray-50 dark:bg-gray-800">
                  <button 
                    onClick={handleCreateAppointments}
                    className="w-full py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-[var(--color-primary67)] hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
                  >
                    + New Appointment
                  </button>
                </div>
              </div>
          
              {/* Recent Activities */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="border-b dark:border-gray-700 px-5 py-4 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-100">Recent Activities</h2>
                  <button 
                    onClick={handleHistory}
                    className="text-[var(--color-primary67)] hover:text-[var(--color-primary-7)] text-xs font-medium"
                  >
                    View All
                  </button>
                </div>
          
                <div className="overflow-hidden">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary67)]"></div>
                    </div>
                  ) : error ? (
                    <div className="p-6 text-center text-red-500">{error}</div>
                  ) : calls && calls.length > 0 ? (
                    <div className="overflow-x-auto">
                      <DTable calls={calls} loading={loading} limit={5} />
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          }


          {/* {userRole === "admin" || userRole === "superAdmin" && (
            <div className="col-span-12 xl:col-span-5">
              <DemographicCard />
            </div>
          )} */}
          {(userRole === "admin" || userRole === "superAdmin") && (
            <div className="col-span-12">
              <RecentTransactions />
            </div>
          )}

          {/* Booking Dialog */}
          <Dialog
            open={isOpen && modalContent === null}
            onClose={closeDialog}
            className="fixed inset-0 z-999999 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="relative bg-white max-w-4xl w-full rounded-2xl p-6 flex gap-6 overflow-auto max-h-[90vh]">
              <button
                onClick={closeDialog}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
              <div className="w-full">
                <ConsultationBookingPageContent showSpecialistCategories={false} />
              </div>
            </div>
          </Dialog>

          {/* Modals for Call Now */}
          {isOpen && modalContent === "pricingModal" && (
            <ModalContainer
              modal={
                <PricingModal
                    closeModal={closeDialog}
                    setPrice={(p) => dispatch(setPrice(p))}
                    setDuration={(d) => dispatch(setDuration(d))}
                    specialist={() => useSelector((state) => state.specialist.specialist)}
                    currency="EUR"
                    plans={[
                        {
                            title: "Basic",
                            price: getPrice(900),
                            oldPrice: getOldPrice(900),
                            duration: 900,
                            features: ["Duration: 15 mins", "Quick call", "Summary", "Follow-up", "Laboratory Referral", "Pharmacy Referral",
                                "Laboratory Referral",],
                        },
                        {
                            title: "Delux",
                            price: getPrice(2700, 10),
                            oldPrice: getOldPrice(2700),
                            duration: 2700,
                            features: [
                                "Duration: 45 mins",
                                "10% OFF",
                                "Report",
                                "Follow-up",
                                "Pharmacy Referral",
                                "Laboratory Referral",
                            ],
                            isRecommended: true,
                        },
                        {
                            title: "Premium",
                            price: getPrice(3600, 20),
                            oldPrice: getOldPrice(3600),
                            duration: 3600,
                            features: [
                                "Duration: 60 mins",
                                "20% OFF",
                                "Report",
                                "Follow-up",
                                "Pharmacy Referral",
                                "Laboratory Referral",
                            ],
                        },
                    ]}
                />
              }

            />
          )}

          {isOpen && modalContent === "checkoutModal" && (
            <ModalContainer
              modal={
                <CheckoutModal
                  closeModal={closeDialog}
                  currency="USD"
                  duration={() => useSelector(state => state.specialist.duration)}
                  date={new Date()}
                  consultMode="now"
                />
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}
