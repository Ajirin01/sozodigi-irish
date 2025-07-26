"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchData, updateData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";

const EditHospital = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    lat: "",
    lng: "",
    phone: "",
    email: "",
    website: "",
    accreditation: "",
    open: "",
    close: "",
    emergencyServices: false,
    isVerified: false,
    photo: null,           // New
    existingPhotoUrl: "",  // For preview
  });

  useEffect(() => {
    const loadHospital = async () => {
      try {
        const res = await fetchData(`/hospitals/${id}`, token);
        const hospital = res;

        if(hospital){
            setFormData({
                name: hospital.name,
                address: hospital.location?.address || "",
                city: hospital.location?.city || "",
                state: hospital.location?.state || "",
                country: hospital.location?.country || "",
                postalCode: hospital.location?.postalCode || "",
                lat: hospital.location?.coordinates?.lat || "",
                lng: hospital.location?.coordinates?.lng || "",
                phone: hospital.contact?.phone || "",
                email: hospital.contact?.email || "",
                website: hospital.contact?.website || "",
                accreditation: hospital.accreditation || "",
                open: hospital.operatingHours?.open || "",
                close: hospital.operatingHours?.close || "",
                emergencyServices: hospital.emergencyServices || false,
                isVerified: hospital.isVerified,
                existingPhotoUrl: hospital.photo || "",
            });
        }
      } catch (err) {
        console.error("Failed to fetch hospital:", err);
        addToast("Failed to load hospital data", "error");
      }
    };

    if (id) loadHospital();
  }, [id, token, addToast]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked :
        type === "file" ? files[0] :
        value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const form = new FormData();
    form.append("name", formData.name);
    form.append("accreditation", formData.accreditation);
    form.append("contact[phone]", formData.phone);
    form.append("contact[email]", formData.email);
    form.append("contact[website]", formData.website);
    form.append("location[address]", formData.address);
    form.append("location[city]", formData.city);
    form.append("location[state]", formData.state);
    form.append("location[country]", formData.country);
    form.append("location[postalCode]", formData.postalCode);
    form.append("location[coordinates][lat]", formData.lat);
    form.append("location[coordinates][lng]", formData.lng);
    form.append("operatingHours[open]", formData.open);
    form.append("operatingHours[close]", formData.close);
    form.append("emergencyServices", formData.emergencyServices);
    form.append("isVerified", formData.isVerified);
    if (formData.photo) {
      form.append("photo", formData.photo);
    }
  
    try {
      await updateData(`/hospitals/custom/update/${id}`, form, token, true); // Set last arg to true for multipart
      addToast("Hospital updated successfully!", "success");
      router.push("/admin/hospitals");
    } catch (err) {
      console.error("Error updating hospital:", err);
      addToast("Failed to update hospital", "error");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 dark:text-gray-300 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-4">Edit Hospital</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form inputs exactly same as AddHospital */}
        {["name", "accreditation", "phone", "email", "website", "address", "city", "state", "country", "postalCode", "lat", "lng", "open", "close"].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
            value={formData[field]}
            onChange={handleChange}
            required={["name", "phone", "address", "city", "state", "country"].includes(field)}
            className="p-3 border rounded-lg"
          />
        ))}

        <select
        name="isVerified"
        value={String(formData.isVerified)}
        onChange={(e) => setFormData(prev => ({
            ...prev,
            isVerified: e.target.value === "true"
        }))}
        className="p-3 border rounded-lg col-span-2"
        >
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
        </select>


        <label className="col-span-2 flex items-center space-x-2">
          <input type="checkbox" name="emergencyServices" checked={formData.emergencyServices} onChange={handleChange} />
          <span>Provides Emergency Services</span>
        </label>

        {formData.existingPhotoUrl && (
            <img
                src={formData.existingPhotoUrl}
                alt="Hospital Photo"
                className="col-span-2 max-h-40 object-contain rounded-md"
            />
            )}

            <input
            type="file"
            accept="image/*"
            name="photo"
            onChange={handleChange}
            className="col-span-2 p-3 border rounded-lg"
        />


        <button
          type="submit"
          className="col-span-2 bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Hospital"}
        </button>
      </form>
    </div>
  );
};

export default EditHospital;
