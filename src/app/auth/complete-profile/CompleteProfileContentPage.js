'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { fetchData, updateData } from '@/utils/api';
import { useSession } from "next-auth/react";
import specialistCategories from '@/utils/specialistCategories';
import specialistSpecialties from '@/utils/specialistSpecialties';
import PhoneInput from 'react-phone-input-2';
import { getData } from 'country-list';
import Link from 'next/link';
import { FaUser, FaBriefcase, FaUniversity, FaArrowLeft, FaCloudUploadAlt } from 'react-icons/fa';

const formInput =
  "border-[3px] border-primary-5 text-primary-2 rounded-[20px] overflow-hidden p-2 w-full";

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    DOB: '',
    phone: '',
    address: { street: '', city: '', state: '', country: '' },
    specialty: '',
    licenseNumber: '',
    experience: '',
    languages: '',
    category: '',
    bio: '',
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: ''
    }
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [role, setRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [practicingLicenseFile, setPracticingLicenseFile] = useState(null);

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, 'success');
  const alertError = (msg) => addToast(msg, 'error');

  useEffect(() => {
    const fetchUser = async () => {
      if (!email) return setError('Email is required to complete profile');

      try {
        const user = await fetchData(`users/get/by-email?email=${email}`);
        if (!user) throw new Error(user.message || 'Failed to fetch user');

        setFormData((prev) => ({
          ...prev,
          ...user,
          address: {
            street: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            country: user.address?.country || '',
          },
        }));

        setRole(user.role);
      } catch (err) {
        setError(err.message || 'Error loading user');
      }
    };

    fetchUser();
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else if (name.includes('bankDetails.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfileImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (role === 'specialist') {
      if (!formData.licenseNumber || !formData.specialty || !profileImageFile || !practicingLicenseFile) {
        setError("Please complete all specialist fields.");
        setSubmitting(false);
        return;
      }
    }

    const payload = new FormData();
    for (const key in formData) {
      if (key !== 'address' && key !== 'bankDetails') {
        payload.append(key, formData[key]);
      }
    }
    for (const key in formData.address) {
      payload.append(`address.${key}`, formData.address[key]);
    }
    for (const key in formData.bankDetails) {
      payload.append(`bankDetails.${key}`, formData.bankDetails[key]);
    }
    if (profileImageFile) payload.append('profileImage', profileImageFile);
    if (practicingLicenseFile) payload.append('practicingLicense', practicingLicenseFile);

    try {
      const res = await updateData(`users/complete/profile?email=${email}`, payload, token, true);
      if (!res || res.status > 201) {
        const friendlyMessage = res?.message || 'We couldn’t update your profile at the moment.';
        alertError(friendlyMessage);
        setError(friendlyMessage);
      } else {
        alertSuccess('Profile updated successfully!');
        // router.push("/admin");
        window.location.href = "/admin"
      }
    } catch (err) {
      alertError("Profile update failed.");
      setError("Something went wrong while updating your profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const countries = getData();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-4xl w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        {/* Header */}
        <div className="flex flex-col items-center">
          <Link href="/">
             <img
                width={160}
                height={50}
                className="dark:hidden w-auto h-14 mb-6 hover:scale-105 transition-transform"
                src="/images/logo/logo.png"
                alt="Logo"
              />
              <img
                width={160}
                height={50}
                className="hidden dark:block w-auto h-14 mb-6 hover:scale-105 transition-transform"
                src="/images/logo/logo-dark.png"
                alt="Logo"
              />
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {session?.user?.name ? `Welcome back, ${session.user.name}!` : 'Help us get to know you better.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-10" encType="multipart/form-data">
          
          {/* Section: Personal Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
              <FaUser className="text-blue-500" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name <span className="text-red-500">*</span></label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputStyle} required placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name <span className="text-red-500">*</span></label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputStyle} required placeholder="Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date of Birth <span className="text-red-500">*</span></label>
                <input name="DOB" value={formData.DOB} onChange={handleChange} className={inputStyle} required type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number <span className="text-red-500">*</span></label>
                <PhoneInput
                  country={'ng'}
                  value={formData.phone}
                  onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                  countryCodeEditable={false}
                  inputStyle={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: 'transparent' }}
                  containerClass="phone-input-container"
                  inputProps={{ name: 'phone', required: true }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Street Address</label>
                <input name="address.street" value={formData.address.street} onChange={handleChange} className={inputStyle} placeholder="123 Main St" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">City</label>
                <input name="address.city" value={formData.address.city} onChange={handleChange} className={inputStyle} placeholder="Dublin" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">State / Province</label>
                <input name="address.state" value={formData.address.state} onChange={handleChange} className={inputStyle} placeholder="Dublin" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Country <span className="text-red-500">*</span></label>
                <select name="address.country" value={formData.address.country} onChange={handleChange} className={inputStyle} required>
                  <option value="">Select Country</option>
                  {countries.map(({ code, name }) => (
                    <option key={code} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Professional Details */}
          {(role === 'specialist' || role === 'consultant') && (
             <div className="space-y-6 pt-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                <FaBriefcase className="text-blue-500" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Professional Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {role === 'specialist' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Specialty <span className="text-red-500">*</span></label>
                      <select name="specialty" value={formData.specialty} onChange={handleChange} className={inputStyle} required>
                        <option value="">Select Specialty</option>
                        {specialistSpecialties.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category <span className="text-red-500">*</span></label>
                      <select name="category" value={formData.category} onChange={handleChange} className={inputStyle} required>
                        <option value="">Select Category</option>
                        {specialistCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">License Number <span className="text-red-500">*</span></label>
                      <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className={inputStyle} required placeholder="MD123456" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                        <FaCloudUploadAlt /> Practicing License <span className="text-red-500">*</span>
                      </label>
                      <input type="file" accept="application/pdf,image/*" onChange={(e) => setPracticingLicenseFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" required />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Years of Experience</label>
                  <input name="experience" value={formData.experience} onChange={handleChange} type="number" min="0" className={inputStyle} placeholder="5" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Languages Spoken</label>
                  <input name="languages" value={formData.languages} onChange={handleChange} className={inputStyle} placeholder="English, French" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Professional Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full p-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={4} placeholder="Tell us about your background and expertise..." />
              </div>
            </div>
          )}

          {/* Section: Bank Details */}
          {(role === 'specialist' || role === 'consultant') && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                <FaUniversity className="text-blue-500" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Bank Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Account Name</label>
                  <input name="bankDetails.accountName" value={formData.bankDetails.accountName} onChange={handleChange} className={inputStyle} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Account Number</label>
                  <input name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} className={inputStyle} placeholder="0123456789" />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bank Name</label>
                  <input name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} className={inputStyle} placeholder="Irish Health Bank" />
                </div>
              </div>
            </div>
          )}

          {/* Profile Image & Submit */}
          <div className="pt-10 space-y-8 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col items-center">
               <label className="text-lg font-bold text-gray-800 dark:text-white mb-4">Profile Photo</label>
               <div className="relative group">
                 <div className="w-32 h-32 rounded-full border-4 border-blue-100 dark:border-gray-700 overflow-hidden shadow-lg transition-transform group-hover:scale-105">
                   {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <FaUser className="text-gray-400 text-4xl" />
                      </div>
                    )}
                 </div>
                 <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                 <div className="mt-4 text-center">
                    <span className="text-xs text-blue-600 font-bold hover:underline">Click to upload photo</span>
                 </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 py-4 px-6 rounded-2xl text-white font-bold text-lg shadow-xl transition-all active:scale-95 ${
                  submitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {submitting ? 'Updating Profile...' : 'Save & Continue'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-lg hover:bg-gray-50 transition-colors"
              >
                Skip For Now
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = "w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white";

