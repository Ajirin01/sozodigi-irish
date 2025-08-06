'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { fetchData, updateData } from '@/utils/api';
import { useSession } from "next-auth/react";
import specialistCategories from '@/utils/specialistCategories';
import specialistSpecialties from '@/utils/specialistSpecialties';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getData } from 'country-list';

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
    bio: ''
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
      if (key !== 'address') payload.append(key, formData[key]);
    }
    for (const key in formData.address) {
      payload.append(`address.${key}`, formData.address[key]);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl overflow-hidden grid md:grid-cols-2">
        {/* Left: Image or branding */}
        <div className="hidden md:flex flex-col items-center justify-center bg-[var(--color-primary-7)] p-6 text-white">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">
              {session?.user?.name ? `Welcome, ${session.user.name}!` : 'Welcome!'}
            </h2>
            <p className="text-lg">Complete your profile to get started.</p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="mt-4 px-6 py-2 border border-white rounded-full text-white hover:bg-white hover:text-[var(--color-primary-7)] transition"
          >
            Complete Later
          </button>
        </div>


        {/* Right: Form */}
        <div className="p-8">
          <h1 className="text-2xl font-semibold text-gray-700 mb-4">Complete Your Profile</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm text-gray-600">First Name <span className='text-red-700'>*</span></label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputStyle} required />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Last Name <span className='text-red-700'>*</span></label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputStyle} required />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Date of Birth <span className='text-red-700'>*</span></label>
                <input name="DOB" value={formData.DOB} onChange={handleChange} className={inputStyle} required />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Phone <span className='text-red-700'>*</span></label>
                <PhoneInput
                  country={'ng'}               // Change 'ng' to your preferred default country code
                  value={formData.phone}
                  onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                  countryCodeEditable={false}  // disables editing the country code prefix
                  inputStyle={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '20px',
                    border: '2px solid rgba(38, 51, 71, 0.11)',
                  }}
                  buttonStyle={{
                    borderRadius: '20px 0 0 20px',
                    border: '2px solid rgba(38, 51, 71, 0.11)',
                  }}
                  inputProps={{
                    name: 'phone',
                    required: true,
                  }}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Street</label>
                <input name="address.street" value={formData.address.street} onChange={handleChange} className={inputStyle} />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">City</label>
                <input name="address.city" value={formData.address.city} onChange={handleChange} className={inputStyle} />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">State</label>
                <input name="address.state" value={formData.address.state} onChange={handleChange} className={inputStyle} />
              </div>
              <div className="col-span-full">
                <label className="block mb-1 text-sm text-gray-600">Country</label>
                <select
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(({ code, name }) => (
                    <option key={code} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {role === 'specialist' && (
              <>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Specialty <span className='text-red-700'>*</span></label>
                  <select name="specialty" value={formData.specialty} onChange={handleChange} className={inputStyle} required>
                    <option value="">Select Specialty</option>
                    {specialistSpecialties.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Category <span className='text-red-700'>*</span></label>
                  <select name="category" value={formData.category} onChange={handleChange} className={inputStyle} required>
                    <option value="">Select Category</option>
                    {specialistCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">License Number <span className='text-red-700'>*</span></label>
                  <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className={inputStyle} required />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Upload Practicing License <span className='text-red-700'>*</span></label>
                  <input type="file" accept="application/pdf,image/*" onChange={(e) => setPracticingLicenseFile(e.target.files[0])} className={inputStyle} required />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Short Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full p-2 border-2 rounded focus:outline-none focus:ring focus:border-blue-400 text-sm" rows={4} />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Years of Experience</label>
                  <input name="experience" value={formData.experience} onChange={handleChange} type="number" min="0" className={inputStyle} />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Languages Spoken</label>
                  <input name="languages" value={formData.languages} onChange={handleChange} className={inputStyle} />
                </div>
              </>
            )}

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">Profile Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className={inputStyle} />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 h-24 w-24 rounded-full object-cover shadow" />
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2 px-4 rounded-md text-white font-semibold transition ${
                submitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-[var(--color-primary-7)] hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Saving...' : 'Save & Continue'}
            </button>

            {/* Complete Later button visible only on small screens */}
            <button
              type="button"
              onClick={() => router.push('/admin')} // Adjust redirect as needed
              className="mt-3 w-full py-2 px-4 rounded-md border border-[var(--color-primary-7)] text-[var(--color-primary-7)] font-semibold hover:bg-[var(--color-primary-7)] hover:text-white transition md:hidden"
            >
              Complete Later
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle = "w-full p-2 border-2 rounded-full focus:outline-none focus:ring focus:border-blue-400 text-sm";

