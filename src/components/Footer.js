"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { FaEnvelope, FaPhoneAlt, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { logoDark } from "@/assets"; // Make sure logoDark is an actual image file or static import

const FooterLink = ({ href, children }) => (
  <Link
    href={href}
    className="text-white/80 hover:text-white transition-colors duration-300 py-1 hover:translate-x-1 inline-block transform"
  >
    {children}
  </Link>
);

const FooterSection = ({ title, children }) => (
  <div className="flex flex-col gap-y-3">
    <h4 className="font-bold text-xl text-white mb-2">{title}</h4>
    <ul className="space-y-2">{children}</ul>
  </div>
);

const SocialIcon = ({ icon: Icon, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors duration-300"
  >
    <Icon className="text-white text-lg" />
  </a>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-[var(--color-primary-8)] to-[var(--color-primary-10)] rounded-t-3xl mx-4 mt-8 overflow-hidden">
    {/* Background Overlay Image */}
    <Image
      src="/images/pattern1.jpg"
      alt="Background Overlay"
      fill
      className="object-cover opacity-2 pointer-events-none z-0"
    />
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Logo & About */}
          <div className="flex flex-col gap-y-4">
            <Image src={logoDark} alt="SozoDigiCare" width={200} height={60} className="mb-2" />
            <p className="text-white/80 text-sm mb-4 max-w-xs">
              Bridging the gap between advanced healthcare and accessibility through innovative solutions.
            </p>
            <div className="flex space-x-3 mt-2">
              <SocialIcon icon={FaFacebookF} href="#" />
              <SocialIcon icon={FaTwitter} href="#" />
              <SocialIcon icon={FaInstagram} href="#" />
              <SocialIcon icon={FaLinkedinIn} href="#" />
            </div>
          </div>

          {/* The Platform */}
          <FooterSection title="The Platform">
            <li><FooterLink href="/auth/sign-in">Log in</FooterLink></li>
            <li><FooterLink href="/auth/sign-up">Sign up</FooterLink></li>
            <li><FooterLink href="/auth/sign-up?role=pharmacist">Register Pharmacy</FooterLink></li>
            <li><FooterLink href="/auth/sign-up?role=labAdmin">Register Laboratory</FooterLink></li>

            <li><FooterLink href="/terms">Terms of Use</FooterLink></li>
          </FooterSection>

          {/* Company */}
          <FooterSection title="Company">
            <li><FooterLink href="/blog">Blog</FooterLink></li>
            <li><FooterLink href="/about">About Us</FooterLink></li>
            <li><FooterLink href="/contact">Contact Us</FooterLink></li>
          </FooterSection>

          {/* Legal */}
          <FooterSection title="Legal">
            <li><FooterLink href="/cookie-policy">Cookie Policy</FooterLink></li>
            <li><FooterLink href="/privacy-policy">Privacy Policy</FooterLink></li>
            <li><FooterLink href="/data-privacy">Data Privacy</FooterLink></li>
            <div className="mt-6 text-white/80 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <FaEnvelope className="text-secondary-6" />
                <span>Contact@sozodigicare.ie</span>
              </div>
              <div className="flex items-center gap-2">
                {/* <FaPhoneAlt className="text-secondary-6" /> */}
                {/* <span>+1 (800) 123-4567</span> */}
              </div>
            </div>
          </FooterSection>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8"></div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-white/70 text-sm">
          <p>© {currentYear} SozoDigiCare. All rights reserved.</p>
          <p className="mt-3 md:mt-0">Designed with care for better healthcare accessibility</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
