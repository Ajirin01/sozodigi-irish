"use client";
import AuthNavbar from "@/components/Navbar";
import "./globals.css";
import Footer from "@/components/Footer";

export default function AuthLayout({ children }) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <AuthNavbar />
      <main className="container mx-auto p-4">{children}</main>
      <Footer />
    </div>
  );
}
