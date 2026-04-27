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
import Link from 'next/link';
import { FaUser, FaBriefcase, FaUniversity, FaCloudUploadAlt, FaSave } from 'react-icons/fa';

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
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: ''
    }
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
          bankDetails: {
            accountName:   user.bankDetails?.accountName   || '',
            accountNumber: user.bankDetails?.accountNumber || '',
            bankName:      user.bankDetails?.bankName      || '',
          }
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
    } else if (name.startsWith('bankDetails.')) {
      const [, field] = name.split('.');
      setFormData(f => ({
        ...f,
        bankDetails: { ...f.bankDetails, [field]: value },
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
      if (k !== 'address' && k !== 'bankDetails') payload.append(k, v);
    });
    // address
    Object.entries(formData.address).forEach(([k, v]) =>
      payload.append(`address.${k}`, v)
    );
    // bankDetails
    Object.entries(formData.bankDetails).forEach(([k, v]) =>
      payload.append(`bankDetails.${k}`, v)
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
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Edit Profile</h1>
              <p className="mt-2 text-blue-100 opacity-90">Update your account information and specialist details.</p>
            </div>
            <div className="hidden sm:block">
              <FaUser className="text-5xl opacity-20" />
            </div>
          </div>
        </div>

        {error && (
          <div className="m-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-8 space-y-10">
          
          {/* Section: Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
               <FaUser className="text-blue-600" />
               <h3 className="text-xl font-bold text-gray-800 dark:text-white">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">First Name</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputStyle} required placeholder="First Name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Last Name</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputStyle} required placeholder="Last Name" />
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className={inputStyle} required placeholder="Phone" />
              </div>
            </div>
          </div>

          {/* Section: Address */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
               <div className="w-8 h-8 bg-blue-50 dark:bg-gray-700 rounded-full flex items-center justify-center">
                 <span className="text-blue-600 text-sm">📍</span>
               </div>
               <h3 className="text-xl font-bold text-gray-800 dark:text-white">Location Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full space-y-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Street</label>
                <input name="address.street" value={formData.address.street} onChange={handleChange} className={inputStyle} placeholder="Street" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">City</label>
                <input name="address.city" value={formData.address.city} onChange={handleChange} className={inputStyle} placeholder="City" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">State</label>
                <input name="address.state" value={formData.address.state} onChange={handleChange} className={inputStyle} placeholder="State" />
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Country</label>
                <input name="address.country" value={formData.address.country} onChange={handleChange} className={inputStyle} placeholder="Country" />
              </div>
            </div>
          </div>

          {role === 'specialist' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                <FaBriefcase className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Professional Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className={inputStyle} required>
                    <option value="">Select Category</option>
                    {specialistCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Specialty</label>
                  <select name="specialty" value={formData.specialty} onChange={handleChange} className={inputStyle} required>
                    <option value="">Select Specialty</option>
                    {specialistSpecialties.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">License Number</label>
                  <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className={inputStyle} required placeholder="License Number" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Years of Experience</label>
                  <input name="experience" value={formData.experience} onChange={handleChange} type="number" min="0" className={inputStyle} placeholder="Experience" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Background / Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full p-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={4} placeholder="Bio" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Languages</label>
                <input name="languages" value={formData.languages} onChange={handleChange} className={inputStyle} placeholder="Comma-separated languages" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FaCloudUploadAlt className="text-blue-600" /> Practicing License
                  </label>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-4 text-center hover:border-blue-400 transition-colors">
                    <input type="file" accept="application/pdf,image/*" onChange={handleLicenseChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="text-blue-600">✍️</span> Digital Signature
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-2xl border border-gray-200 dark:border-gray-600">
                    <DoctorSignatureInput onSignature={(dataURL) => setFormData({ ...formData, signatureImage: dataURL })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Bank Details */}
          {(role === 'specialist' || role === 'consultant') && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                <FaUniversity className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Bank Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Account Name</label>
                  <input name="bankDetails.accountName" value={formData.bankDetails.accountName} onChange={handleChange} className={inputStyle} placeholder="Name on account" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Account Number</label>
                  <input name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} className={inputStyle} placeholder="Account Number" />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Bank Name</label>
                  <input name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} className={inputStyle} placeholder="Bank Name" />
                </div>
              </div>
            </div>
          )}

          {/* Section: Profile Image */}
          <div className="space-y-6">
             <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-blue-600">🖼️</span>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Profile Photo</h3>
             </div>
             <div className="flex items-center gap-6">
                <div className="shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 overflow-hidden shadow-inner">
                    <FaUser className="text-gray-300 text-3xl" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                   <p className="text-sm text-gray-500 dark:text-gray-400">Upload a professional photo to build trust with patients.</p>
                   <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                </div>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-4 px-8 rounded-2xl text-white font-bold text-lg shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3 transition-all active:scale-95 ${
                submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {submitting ? 'Saving Changes...' : <><FaSave /> Save Profile Changes</>}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-8 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all";
