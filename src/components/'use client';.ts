'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { fetchData, updateData } from '@/utils/api';
import { useSession } from "next-auth/react";
import { Cat } from 'lucide-react';
import specialistCategories from '@/utils/specialistCategories';
import specialistSpecialties from '@/utils/specialistSpecialties';


export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  console.log(token)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
    },
    specialty: '',
    licenseNumber: '',
    experience: '',
    languages: '',
    category: '',
    bio: ''
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [role, setRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [practicingLicenseFile, setPracticingLicenseFile] = useState(null);

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, 'success');
  const alertError = (msg) => addToast(msg, 'error');

  useEffect(() => {
    const fetchUser = async () => {
      if (!email) {
        setError('Email is required to complete profile');
        return;
      }

      try {
        const user = await fetchData(`users/get/by-email?email=${email}`);

        console.log(user)
        
        if (!user) throw new Error(user.message || 'Failed to fetch user');

        setFormData({
          ...formData,
          ...user,
          address: {
            street: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            country: user.address?.country || '',
          },
        });

        setRole(user.role);
      } catch (err) {
        setError(err.message || 'Error loading user');
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('address.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    setProfileImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
  
    // Validate required fields for specialists
    if (role === 'specialist') {
      if (!formData.licenseNumber || !formData.specialty || !profileImageFile || !practicingLicenseFile) {
        setError("Please fill in all required fields for specialists, including license number, specialty, profile image, and practicing license.");
        setSubmitting(false);
        return;
      }
    }
  
    const payload = new FormData();
  
    for (const key in formData) {
      if (key !== 'address') {
        payload.append(key, formData[key]);
      }
    }
  
    for (const key in formData.address) {
      payload.append(`address.${key}`, formData.address[key]);
    }
  
    if (profileImageFile) {
      payload.append('profileImage', profileImageFile);
    }
  
    if (practicingLicenseFile) {
      payload.append('practicingLicense', practicingLicenseFile);
    }
  
    try {
      const res = await updateData(`users/complete/profile?email=${email}`, payload, token, true);
  
      if (!res || res.status > 201) {
        const friendlyMessage = res?.message || 'We couldn’t update your profile at the moment. Please try again later.';
        alertError(friendlyMessage);
        setError(friendlyMessage);
      } else {
        alertSuccess('Profile updated successfully!');
        window.location.href = "/admin"; // Optionally use router.push if you're inside a Next.js route
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      setError("Something went wrong while updating your profile. Please try again later.");
      alertError("Profile update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <input
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="address.street"
          value={formData.address.street}
          onChange={handleChange}
          placeholder="Street"
          className="w-full p-2 border rounded"
        />
        <input
          name="address.city"
          value={formData.address.city}
          onChange={handleChange}
          placeholder="City"
          className="w-full p-2 border rounded"
        />
        <input
          name="address.state"
          value={formData.address.state}
          onChange={handleChange}
          placeholder="State"
          className="w-full p-2 border rounded"
        />
        <input
          name="address.country"
          value={formData.address.country}
          onChange={handleChange}
          placeholder="Country"
          className="w-full p-2 border rounded"
        />

        {role === 'specialist' && (
        <>
            <select
            name="specialty"
            value={formData.specialty || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            >
            <option value="">Select a specialty</option>
            {specialistSpecialties.map((spec) => (
                <option key={spec} value={spec}>
                {spec}
                </option>
            ))}
            </select>

            <input
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder="License Number"
            className="w-full p-2 border rounded"
            required
            />
            <div>
            <label className="block mb-1 font-medium">Practicing License (PDF or image)</label>
            <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setPracticingLicenseFile(e.target.files[0])}
                className="w-full"
                required
            />
            </div>
            <select
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            >
            <option value="">Select a category</option>
            {specialistCategories.map((cat) => (
                <option key={cat} value={cat}>
                {cat}
                </option>
            ))}
            </select>

            <textarea
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            placeholder="Bio (optional)"
            className="w-full p-2 border rounded"
            rows={4}
            />
            <input
            name="experience"
            value={formData.experience || ''}
            onChange={handleChange}
            placeholder="Years of Experience (optional)"
            className="w-full p-2 border rounded"
            type="number"
            min="0"
            />
            <input
            name="languages"
            value={formData.languages || ''}
            onChange={handleChange}
            placeholder="Languages Spoken (comma separated, optional)"
            className="w-full p-2 border rounded"
            />
        </>
        )}



        {role === 'consultant' && (
          <>
            <input
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Years of Experience"
              className="w-full p-2 border rounded"
            />
            <input
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              placeholder="Languages Spoken"
              className="w-full p-2 border rounded"
            />
          </>
        )}

        <div>
          <label className="block mb-1 font-medium">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2 px-4 rounded-md text-white ${
            submitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {submitting ? 'Saving...' : 'Save & Continue'}
        </button>
      </form>
    </div>
  );
}
