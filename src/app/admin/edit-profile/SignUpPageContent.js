'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { fetchData, updateData } from '@/utils/api';
import { useSession } from 'next-auth/react';
import { useUser } from '@/context/UserContext';

import specialistCategories from '@/utils/specialistCategories';
import specialistSpecialties from '@/utils/specialistSpecialties';

import DoctorSignatureInput from '@/components/DoctorSignatureInput';

export default function ProfileFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'complete';
  const isEditMode = mode === 'edit';

  const emailFromQuery = searchParams.get('email');
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userEmail = emailFromQuery || session?.user?.email;
  

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: { street: '', city: '', state: '', country: '' },
    // consultant-only
    experience: '',
    languages: '',
    // specialist-only
    category: '',
    specialty: '',
    licenseNumber: '',
    bio: '',
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [practicingLicenseFile, setPracticingLicenseFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();
  const alertSuccess = msg => addToast(msg, 'success');
  const alertError   = msg => addToast(msg, 'error');

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchData(`users/get/by-email?email=${userEmail}`);
        console.log(user)
        setRole(user.role);
        setFormData({
          firstName: user.firstName || '',
          lastName:  user.lastName  || '',
          phone:     user.phone     || '',
          address: {
            street: user.address?.street  || '',
            city:   user.address?.city    || '',
            state:  user.address?.state   || '',
            country:user.address?.country || '',
          },
          experience: user.experience || '',
          languages:       user.languages       || '',
          category:        user.category        || '',
          specialty:       user.specialty       || '',
          licenseNumber:   user.licenseNumber   || '',
          bio:             user.bio             || '',
        });
      } catch (err) {
        setError(err.message);
      }
    }
    if(userEmail){
        loadUser();
    }
  }, [userEmail]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const [, field] = name.split('.');
      setFormData(f => ({
        ...f,
        address: { ...f.address, [field]: value },
      }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleFileChange = e => setProfileImageFile(e.target.files[0]);
  const handleLicenseChange = e => setPracticingLicenseFile(e.target.files[0]);
  

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate specialist required
    if (role === 'specialist') {
      if (!formData.category || !formData.specialty || !formData.licenseNumber) {
        setError('Category, Specialty and License Number are required.');
        setSubmitting(false);
        return;
      }
    }

    const payload = new FormData();
    // flat fields
    Object.entries(formData).forEach(([k, v]) => {
      if (k !== 'address') payload.append(k, v);
    });
    // address
    Object.entries(formData.address).forEach(([k, v]) =>
      payload.append(`address.${k}`, v)
    );
    // files
    if (profileImageFile)      payload.append('profileImage', profileImageFile);
    if (practicingLicenseFile) payload.append('practicingLicense', practicingLicenseFile);

    if (formData.signatureImage) {
      const signatureFile = dataURLtoFile(formData.signatureImage, 'signature.png');
      payload.append('signature', signatureFile);
    }

    // if (signatureFile) payload.append('signature', signatureFile);

    try {
        // console.log(formData)
        // return
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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      <h1 className="text-2xl font-bold mb-4">
        Edit Your Profile
      </h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        {/* Basic */}
        <input
          name="firstName" placeholder="First Name" required
          className="w-full p-2 border rounded"
          value={formData.firstName} onChange={handleChange}
        />
        <input
          name="lastName" placeholder="Last Name" required
          className="w-full p-2 border rounded"
          value={formData.lastName} onChange={handleChange}
        />
        <input
          name="phone" placeholder="Phone" required
          className="w-full p-2 border rounded"
          value={formData.phone} onChange={handleChange}
        />

        {/* Address */}
        <input
          name="address.street" placeholder="Street"
          className="w-full p-2 border rounded"
          value={formData.address.street} onChange={handleChange}
        />
        <input
          name="address.city" placeholder="City"
          className="w-full p-2 border rounded"
          value={formData.address.city} onChange={handleChange}
        />
        <input
          name="address.state" placeholder="State"
          className="w-full p-2 border rounded"
          value={formData.address.state} onChange={handleChange}
        />
        <input
          name="address.country" placeholder="Country"
          className="w-full p-2 border rounded"
          value={formData.address.country} onChange={handleChange}
        />

        {/* Specialist Section */}
        {role === 'specialist' && (
          <>
            <select
              name="category" required
              className="w-full p-2 border rounded dark:bg-gray-900 dark:text-gray-300"
              value={formData.category} onChange={handleChange}
            >
              <option value="">Select Category</option>
              {specialistCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              name="specialty" required
              className="w-full p-2 border rounded dark:bg-gray-900 dark:text-gray-300"
              value={formData.specialty} onChange={handleChange}
            >
              <option value="">Select Specialty</option>
              {specialistSpecialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <input
              name="licenseNumber" placeholder="License Number" required
              className="w-full p-2 border rounded"
              value={formData.licenseNumber} onChange={handleChange}
            />

            <textarea
              name="bio" placeholder="Bio (optional)"
              className="w-full p-2 border rounded"
              rows={4}
              value={formData.bio} onChange={handleChange}
            />

            <input
              name="experience" type="number" min="0"
              placeholder="Years of Experience (optional)"
              className="w-full p-2 border rounded"
              value={formData.experience} onChange={handleChange}
            />

            <input
              name="languages" placeholder="Languages (comma-separated)"
              className="w-full p-2 border rounded"
              value={formData.languages} onChange={handleChange}
            />

            <div>
              <label className="block mb-1">Practicing License (PDF/image)</label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleLicenseChange}
                className="w-full"
                // required={!isEditMode}
              />
            </div>

            <div>
              <label className="block mb-1">Signature (image)</label>
              <DoctorSignatureInput onSignature={(dataURL) => setFormData({ ...formData, signatureImage: dataURL })} />
            </div>
          </>
        )}

        {/* Consultant Section */}
        {role === 'consultant' && (
          <>
            <input
              name="experience" placeholder="Years of Experience"
              className="w-full p-2 border rounded"
              value={formData.experience} onChange={handleChange}
            />
            <input
              name="languages" placeholder="Languages Spoken"
              className="w-full p-2 border rounded"
              value={formData.languages} onChange={handleChange}
            />
          </>
        )}

        {/* Profile Image */}
        <div>
          <label className="block mb-1">Profile Image</label>
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
          className={`w-full py-2 rounded text-white ${
            submitting ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {submitting
            ? 'Saving…'
            : isEditMode
              ? 'Save Changes'
              : 'Save & Continue'}
        </button>
      </form>
    </div>
  );
}
