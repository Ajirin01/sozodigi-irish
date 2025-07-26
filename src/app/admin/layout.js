"use client"

import { SidebarProvider, useSidebar } from "@/context/admin/SidebarContext";
import { ToastProvider } from "@/context/ToastContext";
import AuthSessionProvider from "@/app/SessionProvider";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { ThemeProvider } from "@/context/admin/ThemeContext";
import useSocketEmitOnline from "@/hooks/useSocketEmitOnline";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import PushNotificationButton from "@/components/PushNotificationButton"; // Import your component
import { usePathname } from "next/navigation";


export default function AdminLayout({ children }) {
  return (
    <AuthSessionProvider>
      <ToastProvider>
        <ThemeProvider>
          <SidebarProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
          </SidebarProvider>
        </ThemeProvider>
      </ToastProvider>
    </AuthSessionProvider>
  );
}

function AdminLayoutContent({ children }) {
  const pathname = usePathname();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const {
    showSoundPrompt,
    setShowSoundPrompt,
    enableSoundNotifications,
    IncomingCallDialogWrapper,
  } = useSocketEmitOnline();

  const isSessionPage = /^\/admin\/appointments\/session\/[^\/]+$/.test(pathname);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  // useEffect(() => {
  //   setShowSoundPrompt(!Boolean(localStorage.getItem("soundEnabled")))
  // }, [])

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className={`min-h-screen xl:flex dark:bg-gray-900 dark:text-gray-300`}>
      {!isSessionPage && <AppSidebar />}
      {!isSessionPage && <Backdrop />}

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          !isSessionPage ? mainContentMargin : ""
        }`}
      >
        {!isSessionPage && <AppHeader />}
        <div className={`p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6`}>
          {children}
        </div>
        {IncomingCallDialogWrapper}

        {((role === "specialist" || role === "consultant") && showSoundPrompt) && (
          <ConfirmationDialog
            isOpen={showSoundPrompt}
            title="Enable Sound Notifications?"
            message="We can alert you with a ringtone when an incoming call arrives. Do you want to enable this?"
            confirmText="Yes, enable sound"
            cancelText="No, stay silent"
            onConfirm={() => {
              enableSoundNotifications();
              setShowSoundPrompt(false);
            }}
            onClose={() => {
              setShowSoundPrompt(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
