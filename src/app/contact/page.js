'use client'
import React, { useState } from 'react';
import { FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { postData } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subject: 'Medical Tourism Inquiry'
  });
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await postData('contact', formData);
      addToast('Message sent successfully!', 'success');
      setFormData({ name: '', email: '', message: '', subject: 'Medical Tourism Inquiry' });
    } catch (error) {
      addToast(error.message || 'Failed to send message', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen px-10">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Contact Us</h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-6">
                We're here to help and answer any question you might have. We look forward to hearing from you.
              </p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <FaEnvelope className="text-[var(--color-primary-6)] mr-4" />
                  <span className="text-gray-700">Contact@sozodigicare.ie</span>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-[var(--color-primary-6)] mr-4" />
                  <span className="text-gray-700"> 11 The Avenue Folkstown Park. Balbriggan Co Dublin.</span>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 bg-[var(--color-primary-6)] p-6 text-white">
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-2" htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-gray-700 bg-gray-200 rounded" 
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2" htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-gray-700 bg-gray-200 rounded" 
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2" htmlFor="message">Message</label>
                  <textarea 
                    id="message" 
                    rows="4" 
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-gray-700 bg-gray-200 rounded"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-white text-[var(--color-primary-6)] font-bold py-2 px-4 rounded hover:bg-gray-100 transition duration-300 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
