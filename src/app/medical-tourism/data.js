import { FaPlane, FaHospital, FaUserMd, FaGlobe, FaMoneyBillWave, FaCalendarAlt, FaHandHoldingMedical, FaPassport, FaCut, FaBone, FaHeartbeat, FaBaby, FaTooth, FaStethoscope, FaWeight, FaYinYang } from 'react-icons/fa';


const services = [
    {
      icon: <FaUserMd />,
      title: "Medical Consultations",
      description: "Tailored treatment plans based on your medical history.",
      details: "Our expert medical team provides in-depth consultations to understand your unique health needs. We analyze your medical history, current condition, and goals to create a personalized treatment plan that ensures the best possible outcomes."
    },
    {
      icon: <FaHospital />,
      title: "Hospital Selection",
      description: "We connect you with accredited facilities worldwide.",
      details: "We partner with Joint Commission International (JCI) accredited hospitals and clinics across the globe. Our rigorous selection process ensures you receive care at facilities that meet the highest international standards for quality and patient safety."
    },
    {
      icon: <FaPlane />,
      title: "Travel Coordination",
      description: "Seamless travel arrangements for your medical journey.",
      details: "From booking flights to arranging comfortable accommodations near your treatment facility, we handle all aspects of your travel. Our team also assists with visa applications and provides detailed information about your destination to ensure a stress-free journey."
    },
    {
      icon: <FaHandHoldingMedical />,
      title: "Treatment Management",
      description: "Coordinating all aspects of your medical care.",
      details: "We liaise between you, your home doctors, and your international medical team to ensure seamless communication and continuity of care. Our staff is available 24/7 to address any concerns and manage any aspects of your treatment process."
    },
    {
      icon: <FaCalendarAlt />,
      title: "Post-Treatment Care",
      description: "Ongoing support for your recovery process.",
      details: "Your care doesn't end when you return home. We provide comprehensive follow-up services, including virtual consultations with your treating physicians, coordination with local healthcare providers, and continuous support throughout your recovery journey."
    },
    {
      icon: <FaGlobe />,
      title: "Concierge Services",
      description: "Personalized assistance throughout your stay.",
      details: "Experience comfort and convenience with our premium concierge services. From arranging private transportation and interpreters to booking local tours and activities for accompanying family members, we ensure your medical journey is as comfortable and enjoyable as possible."
    },
  ];

  const specialties = [
    {
      icon: <FaCut />,
      title: "Cosmetic Surgery",
      description: "Enhance your appearance with expert procedures.",
      procedures: ["Facelifts", "Liposuction", "Breast augmentation", "Rhinoplasty"]
    },
    {
      icon: <FaBone />,
      title: "Orthopedic Procedures",
      description: "Restore mobility and reduce pain with our orthopedic treatments.",
      procedures: ["Knee replacements", "Hip replacements", "Spine surgeries", "Joint care"]
    },
    {
      icon: <FaHeartbeat />,
      title: "Cardiology",
      description: "World-class care for your heart health needs.",
      procedures: ["Heart surgeries", "Angioplasty", "Cardiovascular diagnostics"]
    },
    {
      icon: <FaBaby />,
      title: "Fertility Treatments",
      description: "Cutting-edge treatments to help you start or grow your family.",
      procedures: ["IVF", "Egg donation", "Reproductive health services"]
    },
    {
      icon: <FaTooth />,
      title: "Dental Care",
      description: "Achieve the perfect smile with our advanced dental treatments.",
      procedures: ["Dental implants", "Veneers", "Crowns", "Full-mouth restoration"]
    },
    {
      icon: <FaStethoscope />,
      title: "Oncology",
      description: "Comprehensive cancer care with the latest treatment options.",
      procedures: ["Cancer surgeries", "Chemotherapy", "Radiation therapy"]
    },
    {
      icon: <FaWeight />,
      title: "Bariatric Surgery",
      description: "Effective weight loss solutions for a healthier life.",
      procedures: ["Gastric bypass", "Gastric sleeve", "Adjustable gastric banding"]
    },
    {
      icon: <FaYinYang />,
      title: "Wellness and Rehabilitation",
      description: "Holistic approaches to enhance your overall well-being.",
      procedures: ["Physical therapy", "Detox programs", "Holistic wellness therapies"]
    }
  ];

  const destinations = [
    { name: "Thailand", coordinates: [13, 100], specialties: ["Cosmetic", "Dental"] },
    { name: "India", coordinates: [20, 77], specialties: ["Cardiac", "Orthopedic"] },
    { name: "Turkey", coordinates: [39, 35], specialties: ["Hair Transplant", "Dental"] },
    { name: "Mexico", coordinates: [23, -102], specialties: ["Bariatric", "Dental"] },
    { name: "Costa Rica", coordinates: [10, -84], specialties: ["Dental", "Wellness"] },
    { name: "Hungary", coordinates: [47, 19], specialties: ["Dental", "Thermal Spa"] },
  ];

module.exports = {
    services,
    specialties,
    destinations
}
