"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { fetchData, updateData } from '@/utils/api';
import { useSession } from 'next-auth/react';
import { defaultUser } from '@/assets';
import { FaCamera } from 'react-icons/fa';
import DoctorSignatureInput from '@/components/DoctorSignatureInput';
import specialistCategories from '@/utils/specialistCategories';
import specialistSpecialties from '@/utils/specialistSpecialties';

export default function ProfileFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'complete';
  const isEditMode = mode === 'edit';

  const emailFromQuery = searchParams.get('email');
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userEmail = emailFromQuery || session?.user?.email;
  const apiUrl = process.env.NEXT_PUBLIC_NODE_BASE_URL;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: { street: '', city: '', state: '', country: '' },
    experience: '',
    languages: '',
    category: '',
    specialty: '',
    licenseNumber: '',
    bio: '',
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();
  const alertSuccess = msg => addToast(msg, 'success');
  const alertError = msg => addToast(msg, 'error');

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchData(`users/get/by-email?email=${userEmail}`);
        setRole(user.role);
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          address: {
            street: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            country: user.address?.country || '',
          },
          experience: user.experience || '',
          languages: user.languages || '',
          category: user.category || '',
          specialty: user.specialty || '',
          licenseNumber: user.licenseNumber || '',
          bio: user.bio || '',
        });
        if (user.profileImage) {
          setSelectedImagePreview(`${apiUrl}${user.profileImage}`);
        }
      } catch (err) {
        setError(err.message);
      }
    }
    if (userEmail) {
      loadUser();
    }
  }, [userEmail]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const [, field] = name.split('.');
      setFormData(f => ({ ...f, address: { ...f.address, [field]: value } }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setSelectedImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLicenseChange = e => setFormData(prev => ({ ...prev, license: e.target.files[0] }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k !== 'address') payload.append(k, v);
    });
    Object.entries(formData.address).forEach(([k, v]) =>
      payload.append(`address.${k}`, v)
    );
    if (profileImageFile) payload.append('profileImage', profileImageFile);

    try {
      const res = await updateData(
        `users/complete/profile?email=${userEmail}`,
        payload,
        token,
        true
      );
      if (res.status > 201) {
        setError(res.message);
        alertError(res.message);
      } else {
        alertSuccess('Profile updated successfully!');
        router.push('/admin');
      }
    } catch (err) {
      setError(err.message);
      alertError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="main p-4 md:p-8 w-full">
      <div className="mb-8">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-[var(--color-primary-1)] p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <img
                  className="border-4 rounded-full w-24 h-24 md:w-32 md:h-32 border-white object-cover"
                  src={selectedImagePreview || defaultUser.src}
                  alt="User"
                />
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-2 right-2 bg-white p-2 rounded-full cursor-pointer"
                >
                  <FaCamera className="text-[var(--color-primary-6)]" />
                  <input
                    id="profileImage"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h1 className="font-bold text-2xl md:text-3xl text-[var(--color-primary-7)] mb-2">
                  {formData.firstName} {formData.lastName}
                </h1>
                <div className="text-[var(--color-primary-6)] mb-4">{role}</div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-full bg-[var(--color-primary-6)] text-white hover:bg-[var(--color-primary-7)]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-6 md:p-8 text-sm md:text-base">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block mb-2 text-[var(--color-primary-6)]">First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-primary-6)]">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-primary-6)]">Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-primary-6)]">Street</label>
                <input
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-primary-6)]">City</label>
                <input
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-primary-6)]">State</label>
                <input
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-primary-6)]">Country</label>
                <input
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {role === 'specialist' && (
                <>
                  <div>
                    <label className="block mb-2 text-[var(--color-primary-6)]">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">Select Category</option>
                      {specialistCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-[var(--color-primary-6)]">Specialty</label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">Select Specialty</option>
                      {specialistSpecialties.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-[var(--color-primary-6)]">License Number</label>
                    <input
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[var(--color-primary-6)]">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows={4}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block mb-2 text-[var(--color-primary-6)]">Experience</label>
                <input
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-primary-6)]">Languages</label>
                <input
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
