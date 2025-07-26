'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchData } from '@/utils/api';
import { toast } from 'react-toastify';
import { defaultUser } from '@/assets';
import { FaCalendarAlt, FaLocationArrow, FaStar, FaGraduationCap, FaUserMd, FaSearch, FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Dialog } from "@headlessui/react";

import DirectSpecialistBook from "@/components/DirectSpecialistBook"
import { X } from "lucide-react";

import { useSelector, useDispatch } from "react-redux";

import { setSpecialist} from '@/store/specialistSlice'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'


const DoctorsPage = ({ limit = 6 }) => {
  const [isOpen, setIsOpen] = useState(false);

//   const navigate = useNavigate();
  const [specialists, setSpecialists] = useState([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortOption, setSortOption] = useState('rating'); // 'rating', 'experience', 'name'
  
  const apiUrl = process.env.NEXT_PUBLIC_NODE_BASE_URL;

  const dispatch = useDispatch()


  // Fetch specialists data
  useEffect(() => {
    async function fetchDoctors() {
      try {
        setLoading(true);
        const response = await fetchData("users/get-all/doctors/no-pagination");
        if (response) {
          const doctorsData = response;
          console.log("Fetched doctors:", doctorsData);
          const gpsOnly = doctorsData.filter((specialist) =>
            (specialist.category || "").trim().toLowerCase() === "general practitioner"
            );
          setSpecialists(gpsOnly.slice(0, limit));
          setFilteredSpecialists(gpsOnly.slice(0, limit));
          console.log(filteredSpecialists)
        } else {
          console.error("Invalid response format:", response);
          setError("Failed to load doctors data. Please try again later.");
          toast.error("Failed to load doctors data");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching specialists:", error);
        setError("Failed to load doctors data. Please try again later.");
        setLoading(false);
        toast.error("Failed to load doctors data");
      }
    }
    
    fetchDoctors();
  }, []);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedDoctor(null);
    document.body.style.overflow = 'auto';
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const openDialog = (doctor) => {
    setSelectedDoctor(doctor);
    setIsOpen(true);
  };

  const handleBookAppointment = (doctor) => {
    openDialog(doctor); dispatch(setSpecialist(doctor));
  };

  const DoctorImage = ({ profileImage, alt = 'Doctor' }) => {
    const [imgSrc, setImgSrc] = useState(profileImage ? `${apiUrl}${profileImage}` : defaultUser.src);
  
    return (
      <Image
        src={imgSrc}
        alt={alt}
        width={150}
        height={150}
        onError={() => setImgSrc(defaultUser.src)}
        className="h-48 w-full object-cover transition-transform group-hover:scale-105"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[var(--color-primary-6)] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredSpecialists.length && 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpecialists.map((doctor) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative">
                <DoctorImage profileImage={doctor.profileImage} />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={`h-4 w-4 ${i < (doctor.rating || 0) ? 'text-yellow-400' : 'text-gray-400'}`} 
                        />
                      ))}
                      <span className="ml-1 text-xs text-white font-medium">{doctor.rating || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-[var(--color-primary-6)] text-sm font-medium mb-3">{doctor.category}</p>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <FaGraduationCap className="mr-2 text-gray-500" />
                    <span>{doctor.qualifications || 'Medical Professional'}</span>
                  </div>
                  
                  {/* <div className="flex items-center text-gray-600 text-sm">
                    <FaLocationArrow className="mr-2 text-gray-500" />
                    <span>{doctor.location || 'Available Online'}</span>
                  </div> */}
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleDoctorSelect(doctor)}
                      className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => handleBookAppointment(doctor)}
                      className="flex-1 py-2 px-3 bg-[var(--color-primary-6)] hover:bg-[var(--color-primary-7)] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <FaCalendarAlt className="mr-1.5" />
                      Book
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        }
      </div>
      
      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="relative">
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              
              <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden">
                <div className="md:w-1/3 bg-gradient-to-br from-[var(--color-primary-7)] to-[var(--color-primary-5)] p-8 text-white">
                  <div className="mb-6 flex flex-col items-center">
                    <img
                      src={selectedDoctor.profileImage ? `${apiUrl}${selectedDoctor.profileImage}` : defaultUser.src}
                      alt={`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                      className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                      crossOrigin="anonymous"
                    />
                    <h2 className="text-2xl font-bold text-center">
                      Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </h2>
                    <p className="text-[var(--color-primary-1)] font-medium">{selectedDoctor.category}</p>
                    
                    <div className="flex items-center mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={`h-5 w-5 ${i < (selectedDoctor.rating || 0) ? 'text-yellow-400' : 'text-white text-opacity-30'}`} 
                        />
                      ))}
                      <span className="ml-2 font-medium">{selectedDoctor.rating || 0}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-[var(--color-primary-1)] font-semibold mb-1">Specialization</h3>
                      <p>{selectedDoctor.category}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-[var(--color-primary-1)] font-semibold mb-1">Qualifications</h3>
                      <p>{selectedDoctor.qualifications || 'Medical Professional'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-[var(--color-primary-1)] font-semibold mb-1">Experience</h3>
                      <p>{selectedDoctor.yearsOfExperience ? `${selectedDoctor.yearsOfExperience} years` : 'Experienced Professional'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-[var(--color-primary-1)] font-semibold mb-1">Location</h3>
                      <p>{selectedDoctor.location || 'Available Online'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3 p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">About Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h3>
                    <p className="text-gray-600">
                      {selectedDoctor.bio || 
                      `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName} is a dedicated healthcare professional specializing in ${selectedDoctor.category}. With a commitment to patient care and extensive experience in the field, Dr. ${selectedDoctor.lastName} provides high-quality medical services to address patient needs effectively.`}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Services</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {selectedDoctor.services ? selectedDoctor.services.map((service, idx) => (
                        <li key={idx}>{service}</li>
                      )) : [
                        `${selectedDoctor.category} Consultation`,
                        'Patient Assessment and Diagnosis',
                        'Specialized Treatment Planning',
                        'Follow-up Care'
                      ].map((service, idx) => (
                        <li key={idx}>{service}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Availability</h3>
                    <p className="text-gray-600 mb-2">
                      Dr. {selectedDoctor.lastName} is available for appointments. Book now to secure your preferred time slot.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      handleBookAppointment(selectedDoctor);
                      closeModal();
                    }}
                    className="w-full py-3 bg-[var(--color-primary-6)] hover:bg-[var(--color-primary-7)] text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Book Appointment
                  </button>
                </div>

                {/* Booking Dialog */}
                <Dialog
                  open={isOpen}
                  onClose={closeDialog}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                  >
                  <div className="relative bg-white max-w-4xl w-full rounded-2xl p-6 flex gap-6 overflow-auto max-h-[90vh] max-w-[90vw]">
                      {/* Close button */}
                      <button
                      onClick={closeDialog}
                      className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                      >
                      <X size={20} />
                      </button>
                      {/* Calendar Step */}
                      <div className="w-full">
                        <DirectSpecialistBook specialist={selectedDoctor} />
                      </div>
                  </div>
                </Dialog>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;