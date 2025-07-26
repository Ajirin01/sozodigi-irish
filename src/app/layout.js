"use client";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AuthSessionProvider from "./SessionProvider";
import { ToastProvider } from "@/context/ToastContext";
import { UserProvider } from "@/context/UserContext";
import AuthWatcher from "@/components/AuthWatcher";
import { ArrowUpCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { Provider } from "react-redux";
import { store } from "@/store/store";

import { ChatBot } from '@/components/gabriel';
import { openChatBot, triggerChatbotAttention } from '@/store/popUpSlice';

export default function RootLayout({ children }) {
  const pathname = usePathname();


  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    setIsVisible(window.scrollY > 300);
  };

  const handleChat = () => {
    dispatch(triggerChatbotAttention());
    dispatch(openChatBot(true));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const s1 = document.createElement("script");
    s1.src = "https://embed.tawk.to/687f67477efc30191580053b/1j0oqms9t";
    s1.async = true;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.body.appendChild(s1);
  }, []);

  
  // Check if we're on the homepage
  const isHomepage = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body className="bg-gray-100" 
      // style={{
      //   backgroundImage: "url('/images/Medical-tourism.jpg')",
      //   backgroundSize: 'cover',
      //   backgroundRepeat: 'no-repeat',
      //   backgroundPosition: 'center',
      // }}
      >
        <AuthSessionProvider>
          <AuthWatcher /> 
          <UserProvider>
            <Provider store={store}>
              <ToastProvider>
                <CartProvider>
                  {/* Conditionally render Navbar only on homepage */}
                  {/* {isHomepage && <Navbar />} */}
                  {/* <Navbar /> */}
                  
                  {!isAdmin && <Navbar />}
                  {children} {/* Children will render as usual */}

                  {/* <ChatBot /> */}

                </CartProvider>
              </ToastProvider>
            </Provider>
          </UserProvider>
        </AuthSessionProvider>


        {isVisible && 
          <button
            onClick={scrollToTop}
            className="fixed bottom-25 right-9 z-50 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
            aria-label="Scroll to top"
          >
            <ArrowUpCircleIcon className="w-6 h-6" />
          </button>
        }

        {!isAdmin && <Footer />}
        
      </body>
    </html>
  );
}
