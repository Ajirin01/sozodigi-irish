"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { postData } from "@/utils/api"; // You can update this to handle FormData or use fetch directly if needed

const AddHospital = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();

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
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
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
    
    form.append("lat", formData.lat);
    form.append("lng", formData.lng);
    form.append("open", formData.open);
    form.append("close", formData.close);
    form.append("emergencyServices", formData.emergencyServices);

    if (photo) {
      form.append("photo", photo);
    }

    try {
      const res = await postData("hospitals/custom/create", form, token, true);

      addToast("Hospital added successfully!", "success");
      router.push("/admin/hospitals");
    } catch (error) {
      console.error("Error adding hospital:", error);
      addToast("Failed to add hospital", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 dark:text-gray-300 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-4">Add New Hospital</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" encType="multipart/form-data">
        {/* Basic Info */}
        <input name="name" placeholder="Hospital Name" value={formData.name} onChange={handleChange} required className="p-3 border rounded-lg" />
        <input name="accreditation" placeholder="Accreditation" value={formData.accreditation} onChange={handleChange} className="p-3 border rounded-lg" />

        {/* Contact */}
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required className="p-3 border rounded-lg" />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="p-3 border rounded-lg" />
        <input name="website" placeholder="Website" value={formData.website} onChange={handleChange} className="p-3 border rounded-lg" />

        {/* Location */}
        <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required className="p-3 border rounded-lg" />
        <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required className="p-3 border rounded-lg" />
        <input name="state" placeholder="State" value={formData.state} onChange={handleChange} required className="p-3 border rounded-lg" />
        <input name="country" placeholder="Country" value={formData.country} onChange={handleChange} required className="p-3 border rounded-lg" />
        <input name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} className="p-3 border rounded-lg" />
        <input name="lat" placeholder="Latitude" value={formData.lat} onChange={handleChange} className="p-3 border rounded-lg" />
        <input name="lng" placeholder="Longitude" value={formData.lng} onChange={handleChange} className="p-3 border rounded-lg" />

        {/* Operating Hours */}
        <input name="open" placeholder="Opening Time (e.g. 08:00 AM)" value={formData.open} onChange={handleChange} className="p-3 border rounded-lg" />
        <input name="close" placeholder="Closing Time (e.g. 08:00 PM)" value={formData.close} onChange={handleChange} className="p-3 border rounded-lg" />

        {/* Emergency Services */}
        <label className="col-span-2 flex items-center space-x-2">
          <input type="checkbox" name="emergencyServices" checked={formData.emergencyServices} onChange={handleChange} />
          <span>Provides Emergency Services</span>
        </label>

        {/* Photo Upload */}
        <label className="col-span-2">
          <span className="block mb-1">Hospital Photo</span>
          <input type="file" name="photo" accept="image/*" onChange={handleFileChange} className="p-3 border rounded-lg w-full" />
        </label>

        <button
          type="submit"
          className="col-span-2 bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Hospital"}
        </button>
      </form>
    </div>
  );
};

export default AddHospital;
