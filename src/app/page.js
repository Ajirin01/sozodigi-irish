'use client'

import { useEffect, useState } from 'react';
import Swiper from 'swiper';
import { fetchData } from '@/utils/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import LottieImage from '@/components/LottieBackground';
import SpecialistCategories from "@/components/specialistCategories";
import DoctorsPage from '@/components/Doctors';
import { 
  FaArrowRight, 
  FaChevronDown, 
  FaChevronUp, 
  FaHeartbeat,  
  FaComments, 
  FaFileMedicalAlt,
  FaPlaneDeparture, 
  FaPrescriptionBottleAlt, 
  FaFlask  } from 'react-icons/fa';


import { aidoc } from '@/assets';
import SimpleCarousel from '@/components/gabriel/SimpleCarousel';
import Button from '@/components/gabriel/Button';
import { cards } from '@/data/cards';
// import { blogs } from '@/data/blogs';
import FaqSection from '@/components/FAQs';
import { useMediaQuery } from 'react-responsive'; 
import TypewriterEffect from '@/components/gabriel/TypewriterEffect';
import { useRouter } from 'next/navigation';
import { openChatBot, triggerChatbotAttention } from '@/store/popUpSlice';
import Illnesses from '@/components/Illnesses'
import { useDispatch } from 'react-redux';
import WhyChooseSozo from '@/components/WhySozo';
import BookAppointment from '@/components/BookAppointmnetBtn';
import CertificateList from '@/components/CertificateList';


function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [packages, setPackages] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [blogs, setBlogs] = useState([])

  const dispatch = useDispatch()

  const router = useRouter()

  const [selectedService, setSelectedService] = useState(null);
  // const iconlist = ['Medical Tourism Solutions', 'Medical Equipment', 'Air Ambulance Services'];
  const iconlist = ['Medical Tourism Solutions', 'Medical Equipment', 'Air Ambulance Services'];

  const services = [
    // {
    //   icon: <FaHeartbeat className="text-5xl text-[var(--color-primary-6)]" />,
    //   title: "Free Symptoms Checker",
    //   description: "Utilize our advanced self-assessment tools to quickly and accurately identify possible health concerns based on your symptoms, helping you make informed decisions about your next steps.",
    //   animation: "M10 10 L50 50 L90 10",
    //   link: "ai"
    // },
    {
      icon: <FaComments className="text-5xl text-[var(--color-primary-6)]" />,
      title: "Real-time Medical Consultation",
      description: "Connect instantly with licensed healthcare professionals through secure video or chat, receiving expert medical advice, diagnosis, and personalized treatment recommendations anytime, anywhere.",
      animation: "M10 50 Q50 10 90 50 Q50 90 10 50",
      link: "/gp-consultation"
    },
    {
      icon: <FaComments className="text-5xl text-[var(--color-primary-6)]" />,
      title: "Real-time Medication and Prescription",
      description: "Connect instantly with licensed healthcare professionals through secure video or chat, receiving expert medical advice, diagnosis, and personalized treatment recommendations anytime, anywhere.",
      animation: "M10 50 Q50 10 90 50 Q50 90 10 50",
      link: "/gp-consultation"
    },
    {
      icon: <FaFileMedicalAlt className="text-5xl text-[var(--color-primary-6)]" />,
      title: "Medical Certificates and Referral Letters",
      description: "Easily obtain official medical certificates, referral letters, and other important documentation from certified doctors to support your health, employment, or insurance needs without unnecessary delays.",
      animation: "M10 30 Q50 60 90 30 Q50 0 10 30",
      link: "/cert"
    },
    // {
    //   icon: <FaPlaneDeparture className="text-5xl text-[var(--color-primary-6)]" />,
    //   title: "Medical Tourism",
    //   description: "Access international healthcare opportunities with assistance in finding top medical facilities abroad, booking appointments, and arranging travel for specialized treatments.",
    //   animation: "M20 20 Q50 80 80 20",
    //   link: "/medical-tourism"
    // },
    // {
    //   icon: <FaPrescriptionBottleAlt className="text-5xl text-[var(--color-primary-6)]" />,
    //   title: "Pharmacy Referral",
    //   description: "Get prescriptions fulfilled quickly by connecting with trusted partner pharmacies near you or opt for doorstep delivery, ensuring timely access to your medications.",
    //   animation: "M10 70 Q50 10 90 70",
    //   link: "/gp-consultation"
    // },
    // {
    //   icon: <FaFlask className="text-5xl text-[var(--color-primary-6)]" />,
    //   title: "Laboratory Referral",
    //   description: "Receive lab test referrals and connect with accredited laboratories for diagnostics, ensuring accurate results and seamless follow-up with your healthcare provider.",
    //   animation: "M10 40 C40 90 60 -10 90 40",
    //   link: "/gp-consultation"
    // },
  ];

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchGalleries() {
      try {
        const data = await fetchData('galleries/get-all/no-pagination');
        setGalleries(data || []);
        console.log(data)
      } catch (error) {
        console.error('Failed to fetch galleries:', error);
      }
    }

    async function fetchBlogs() {
      try {
        const data = await fetchData('blogs');
        setBlogs(data.data || []);
        console.log(data)
      } catch (error) {
        console.error('Failed to fetch galleries:', error);
      }
    }

    async function fetchHospitals() {
      try {
        const data = await fetchData('hospitals');
        setHospitals(data.data || []);
        console.log(data.data)
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
      }
    }

    async function fetchDoctors() {
      try {
        const data = await fetchData('users/get-all/doctors/no-pagination');
        setSpecialists(data || []);
        console.log("doctors", data)
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    }

    async function fetchPackages() {
      try {
        const data = await fetchData('tour/get-all/no-pagination');
        setPackages(data);
        console.log(data)
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      }
    }

    fetchDoctors();
    fetchGalleries();
    fetchHospitals();
    fetchPackages();
    fetchBlogs();
  }, []);

  const handleChat = () => {
    dispatch(triggerChatbotAttention());
    dispatch(openChatBot(true));
  };
  
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  }

  const FAQ = () => {
  
    return (
      <section className="relative faq-section py-20 bg-white rounded-3xl mx-4 mt-8 mb-8">
        <FaqSection />
      </section>
    );
  };

  const renderServiceCard = (card) => (
    <div key={card.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
      <div className="relative h-48">
        <img src={card.image.src} alt={card.content} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <h3 className="text-white font-bold text-xl p-4">{card.content}</h3>
        </div>
      </div>
    </div>
  );

  const renderBlogPost = (blog) => (
    <div key={blog.id} className="w-full">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[320px] flex flex-col">
        <img src={ process.env.NEXT_PUBLIC_NODE_BASE_URL+"/"+blog.featuredImage} alt={blog.title} className="w-full h-40 object-cover" />
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-lg mb-2 text-primary-10 line-clamp-2">{blog.title}</h3>
          <p className="text-gray-600 text-sm mb-2 flex-grow overflow-hidden line-clamp-2">{stripHtml(blog.content)}</p>
          <Link href={ `blog/${blog._id}` } className="text-secondary-6 font-semibold hover:underline inline-flex items-center mt-auto">
            Read More <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );

  const serviceTitles = [...services.map(service => service.title)];

  const handleServiceClick = (service) => {
    setSelectedService(service);
    // You can add more logic here, like opening a modal or navigating to a service page
    // console.log(`Selected service: ${service}`);
  };

  return (
    <div className='px-4'>
      {/* <ChatBot /> */}
      <section className="Hero relative min-h-screen bg-gradient-to-b from-[var(--color-primary-6)] to-white transition-colors overflow-hidden flex items-center rounded-3xl">
        <div className="intro-text p-6 sm:p-10 md:pl-20 flex flex-col justify-center items-start text-left w-full max-w-4xl z-10">
          <h2 className="font-extrabold text-4xl md:text-5xl lg:text-6xl  mb-6">
            <span className="bg-gradient-to-r from-white to-[var(--color-secondary-1)] text-transparent bg-clip-text">Step into the next generation</span>
            <span className="text-white block mt-2">Healthcare Services</span>
            <span className="text-[var(--color-secondary-1)] block mt-2">with our</span>
          </h2>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8">
            <TypewriterEffect words={serviceTitles} typingSpeed={100} erasingSpeed={50} delayBetweenWords={2000} />
          </div>
          <Button
            className="transition-all py-8 px-8 duration-300 hover:scale-105 hover:shadow-xl mt-4 text-lg sm:text-xl font-bold relative overflow-hidden group flex items-center justify-center"
            borderRadius='rounded-small'
            border="border-2 border-white rounded-lg"
            background='bg-gradient-to-r from-[var(--color-primary-6)] to-[var(--color-primary-8)]'
            textColor='text-white'
            onClick={() => router.push('/auth/sign-up')}
          >
            <span className="relative z-10">Sign Up for Free</span>
          </Button> 
        </div>
        <img src={aidoc.src} alt="robo doctor" className="absolute right-[-35px] bottom-0 w-[35rem] max-w-3xl opacity-30 md:opacity-100" />
      </section>

      {/* how it works */}
      <section className="relative z-100 comprehensive-services py-20 bg-white text-white mb-20 rounded-3xl mx-4 mt-8 overflow-hidden">
        {/* Lottie Background */}
        {/* <div className="absolute inset-0 w-full  h-full z-10">
          <LottieImage
            src="/background.json"
            style={{ width: '100%', height: '100%' }}
          />
        </div> */}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-15">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">SIMPLE STEPS TO REAL-TIME CONSULTATION</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Sozo DigiCare has designed a streamlined, user-friendly and secure process for your Video or Phone Consultation. Here’s how it works, simplified into three easy steps:
          </p>

          <div className="relative max-w-6xl mx-auto z-10">
            {/* Arrows between steps */}
            <div className="hidden md:block absolute top-5 left-[20%] w-[25%] pointer-events-none z-0">
              <svg className="w-full h-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 C30,0 70,20 100,10" stroke="#F59E0B" strokeWidth="2" fill="none" strokeDasharray="4,4" markerEnd="url(#arrowhead1)" />
                <defs>
                  <marker id="arrowhead1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#F59E0B" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className="hidden md:block absolute top-5 left-[55%] w-[25%] pointer-events-none z-0">
              <svg className="w-full h-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 C30,0 70,20 100,10" stroke="#F59E0B" strokeWidth="2" fill="none" strokeDasharray="4,4" markerEnd="url(#arrowhead2)" />
                <defs>
                  <marker id="arrowhead2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#F59E0B" />
                  </marker>
                </defs>
              </svg>
            </div>

            {/* Steps */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center w-full md:w-1/3 relative z-10">
                <div className="bg-blue-900 text-orange-500 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                  1
                </div>
                <h3 className="text-xl text-gray-600 font-semibold mt-4">Register</h3>
                <p className="text-gray-600 mt-2"> fill in your details and log in to the dashboard.</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center w-full md:w-1/3 relative z-10">
                <div className="bg-blue-900 text-orange-500 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                  2
                </div>
                <h3 className="text-xl text-gray-600 font-semibold mt-4">Consult a GP</h3>
                <p className="text-gray-600 mt-2">from dashboard click consult a GP now, select your session, and pay </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center w-full md:w-1/3 relative z-10">
                <div className="bg-blue-900 text-orange-500 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-xl text-gray-600 font-semibold mt-4">Consult with a GP</h3>
                <p className="text-gray-600 mt-2">you are live with the GP</p>
              </div>
            </div>
          </div>

          

          {/* CTA Button */}
          <div className="mt-12">
            <BookAppointment />
          </div>
        </div>
      </section>

      {/* Comprehensive Services */}
      <section className="relative z-30 comprehensive-services py-20 bg-white text-white mb-20 rounded-3xl mx-4 mt-8 overflow-hidden">
        {/* Lottie Background */}
        <div className="absolute inset-0 w-full opacity-5 h-full z-15">
          <LottieImage
            src="/background.json"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <h2 className="text-[var(--color-primary-7)] text-3xl md:text-4xl font-bold text-center mb-12">
            Our Comprehensive Services
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden flex flex-col justify-between"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div>
                  <div className="flex justify-center mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-primary-10)] text-center mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-center">{service.description}</p>
                </div>

                <button
                  onClick={() =>
                    service.link === "ai" ? handleChat() : router.push(service.link)
                  }
                  className="mt-6 w-full py-3 px-4 bg-[var(--color-primary-6)] text-white rounded-xl hover:bg-[var(--color-primary-7)] transition text-center block"
                >
                  Get Started
                </button>


                <motion.svg
                  className="absolute bottom-0 left-0 w-full h-12 text-primary-1 opacity-10"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d={service.animation}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  />
                </motion.svg>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Illlnesses */}
      <section className="relative py-16">
        {/* Background layer with opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: "url('/images/illnessBG.png')" }}
        />

        {/* Foreground content */}
        <div className="relative z-10">
          <Illnesses limit={12} />
          <div className="mt-12 text-center">
            <Link href="/gp-consultation">
              <button className="bg-[var(--color-primary-6)] hover:bg-[var(--color-primary-7)] text-white px-6 py-3 rounded-lg shadow-sm transition">
                MORE
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.4 }} 
          className="text-2xl font-bold text-gray-800 mb-8 text-center"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
              Our Doctors
            </h2>
          </div>
          
        </motion.h2>
        
        <DoctorsPage limit={6}  />
      </section>

      {/* Certificates */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.4 }} 
          className="text-2xl font-bold text-gray-800 mb-8 text-center"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
              Medical Certificates and Referral Letters
            </h2>
          </div>
          
        </motion.h2>
        
        <CertificateList max={3} />

        <div className="mt-12 text-center">
            <Link href="/cert">
              <button className="bg-[var(--color-primary-6)] hover:bg-[var(--color-primary-7)] text-white px-6 py-3 rounded-lg shadow-sm transition">
                MORE
              </button>
            </Link>
          </div>
      </section>

      {/* Why Choose Sozo Digicare */}
      <WhyChooseSozo />

      
      

      {/* Become One of Our Specialists */}
      <section className="relative become-specialist py-20 bg-[var(--color-primary-9)] text-white rounded-3xl mx-4 mt-8 mb-8">
        <Image
            src="/images/health.gif"
            alt="Background Overlay"
            fill
            className="object-cover opacity-10 pointer-events-none z-0"
          />
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">JOIN US AS A DOCTOR</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join our team of expert specialists and help us deliver cutting-edge healthcare services.</p>
          <Button
            className="py-3 px-8 text-lg hover:shadow-lg mx-auto transition-all duration-300"
            borderRadius='rounded-full'
            background={'bg-[var(--color-secondary-6)]'}
            textColor='text-white'
            onClick={() => router.push("/auth/sign-up?role=specialist")}
          >
            Apply Now
          </Button>
        </div>
      </section>



      <section className='py-20 bg-gray-50 rounded-3xl mx-4 mt-8'>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-primary-10">Latest Blog Posts</h2>
          <SimpleCarousel items={blogs.map(renderBlogPost)} autoplay={true} autoplayInterval={7000} />
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center text-secondary-6 font-semibold text-lg hover:underline"
            >
              View All Posts <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <FAQ />

      
    </div>
  );
}
