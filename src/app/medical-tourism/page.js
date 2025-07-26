'use client'

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import { medicalTourismHero } from '@/assets';
import { motion, AnimatePresence } from 'framer-motion';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import '@/mapIcons'; // Import the mapIcons file we just created
import { FaPlane, FaHospital, FaUserMd, FaGlobe, FaMoneyBillWave, FaCalendarAlt, FaHandHoldingMedical, FaPassport, FaCut, FaBone, FaHeartbeat, FaBaby, FaTooth, FaStethoscope, FaWeight, FaYinYang } from 'react-icons/fa';
import { services, specialties, destinations } from "./data"
import { useRouter } from 'next/navigation';

// const MapClientOnly = dynamic(() => import('@/components/MapClientOnly'), { ssr: false });

const MedicalTourism = () => {
  // const navigate = useNavigate();
  const [activeService, setActiveService] = useState(0);
  const [expandedService, setExpandedService] = useState(null);
  const [expandedSpecialty, setExpandedSpecialty] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const [hasWindow, setHasWindow] = useState(false);

  const router = useRouter()
  // useEffect(() => {
  //   setHasWindow(typeof window !== 'undefined');
  // }, []);
  

  // useEffect(() => {
  //   if (!hasWindow) return;

  //   // Safe to use window now
  //   console.log('Window width is:', window.innerWidth);
  // }, [hasWindow]);

  const handleContactClick = () => {
    router.push('contact');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % 6);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  

  return (
    <div className="medical-tourism">
      {/* Hero Section */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img src={medicalTourismHero.src} alt="Medical Tourism Hero" className='absolute h-full w-full object-cover' />
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-6xl font-bold mb-4">Welcome to SozoDigiCare</h1>
          <p className="text-2xl mb-8">Your Trusted Medical Tourism Partner</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12">
        {/* About Medical Tourism */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center">Why Choose Medical Tourism?</h2>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 transform skew-y-3"></div>
            <div className="relative bg-white p-8 shadow-lg">
              <p className="text-lg">
                Medical tourism opens doors to advanced treatments abroad, often at a fraction of the cost. With globally accredited hospitals and cutting-edge technology, you can combine top-tier healthcare with the opportunity to recover in serene, exotic locations.
              </p>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-center">Key Benefits of Medical Tourism</h2>
          <div className="flex flex-wrap justify-center">
            {[
              { icon: <FaMoneyBillWave />, title: "Affordable Care", description: "Save up to 80% on procedures" },
              { icon: <FaUserMd />, title: "Expert Doctors", description: "Access to world-class specialists" },
              { icon: <FaCalendarAlt />, title: "No Wait Times", description: "Immediate treatment availability" },
              { icon: <FaHandHoldingMedical />, title: "Personalized Care", description: "Tailored medical experiences" },
              { icon: <FaGlobe />, title: "Travel & Heal", description: "Combine treatment with tourism" },
            ].map((benefit, index) => (
              <div key={index} className="w-1/2 md:w-1/5 p-4 text-center flex flex-col justify-center items-center">
                <div className="text-4xl mb-2 text-blue-500">{benefit.icon}</div>
                <h3 className="font-semibold">{benefit.title}</h3>
                <p className="text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Services */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Comprehensive Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExpandedService(expandedService === index ? null : index)}
              >
                <div className="text-4xl mb-4 text-blue-500">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                {expandedService === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm text-gray-700 mt-2">{service.details}</p>
                  </motion.div>
                )}
                <button
                  className="mt-4 text-blue-500 hover:text-blue-700 transition-colors duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedService(expandedService === index ? null : index);
                  }}
                >
                  {expandedService === index ? 'Read Less' : 'Read More'}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Our Specialties */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Medical Specialties</h2>
          <p className="text-xl text-center mb-8">We cater to a wide range of medical procedures and treatments, with expertise in the following areas:</p>
          <div className="space-y-4">
            {specialties.map((specialty, index) => (
              <motion.div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
                initial={false}
              >
                <motion.header
                  className="bg-gray-100 px-4 py-2 flex items-center cursor-pointer"
                  onClick={() => setExpandedSpecialty(expandedSpecialty === index ? null : index)}
                >
                  <div className="text-2xl mr-4 text-blue-500">{specialty.icon}</div>
                  <h3 className="text-xl font-semibold flex-grow">{specialty.title}</h3>
                  <motion.div
                    initial={false}
                    animate={{ rotate: expandedSpecialty === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ▼
                  </motion.div>
                </motion.header>
                <AnimatePresence initial={false}>
                  {expandedSpecialty === index && (
                    <motion.div
                      key="content"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: "auto" },
                        collapsed: { opacity: 0, height: 0 }
                      }}
                      transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                      <div className="px-4 py-2">
                        <p className="mb-2">{specialty.description}</p>
                        <h4 className="font-semibold mt-2 mb-1">Key Procedures:</h4>
                        <ul className="list-disc list-inside">
                          {specialty.procedures.map((procedure, i) => (
                            <li key={i}>{procedure}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why Choose SozoDigiCare */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-center">Why Choose SozoDigiCare?</h2>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-l from-green-400 to-blue-500 transform -skew-y-3"></div>
            <div className="relative bg-white p-8 shadow-lg">
              <ul className="list-disc pl-5 space-y-2">
                <li>Extensive global network of top-tier medical facilities</li>
                <li>Transparent, competitive pricing with no hidden fees</li>
                <li>24/7 support from dedicated medical tourism professionals</li>
                <li>Partnerships with only accredited hospitals and certified doctors</li>
                <li>Personalized care plans tailored to your unique needs</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Medical Tourism Destinations */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Global Health Havens</h2>
          <div className="relative w-full h-[500px] border border-gray-300 rounded-lg overflow-hidden">
          <section className="mb-20">
            <h2 className="text-4xl font-bold mb-12 text-center">Our Global Health Havens</h2>
            {/* <MapClientOnly /> */}
          </section>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-center">Patient Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "Eunice Ebuala", procedure: "Surgery", location: "Thailand", quote: "SozoDigiCare made my entire medical tourism journey smooth and stress-free. From coordinating my surgery in Thailand to arranging my accommodation, everything was perfectly handled." },
              { name: "Rice Strandford", procedure: "Dental Care", location: "Mexico", quote: "Thanks to the team, I received top-quality dental care in Mexico and saved thousands. I felt supported every step of the way." },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105">
                <div className="p-6">
                  <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-2">{testimonial.procedure} in {testimonial.location}</div>
                  <p className="text-gray-900 font-semibold mb-4">"{testimonial.quote}"</p>
                  <p className="text-gray-600 text-sm">– {testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 rounded-lg shadow-xl">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Medical Journey?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Our team of experts is here to guide you through every step of your medical tourism experience. From choosing the right treatment to planning your travel, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleContactClick}
                className="bg-white text-blue-600 px-8 py-4 rounded-full text-xl font-bold hover:bg-blue-100 transition duration-300 transform hover:scale-105"
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MedicalTourism;