"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { postData } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { useSession } from 'next-auth/react';

export default function CreateGalleryPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { data: session } = useSession()
  const token = session?.user?.jwt

  const { addToast  } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('photo', image);
    formData.append('description', description);
    formData.append('isActive', isActive);

    try {
        // console.log("@@@@@@@@@@@@@@@@@@@@")
        const res = await postData('galleries/custom/create', formData, token, true);
        addToast("Gallery added successfully", "success");
        router.push('/admin/galleries'); // Redirect to gallery list page after creation
    } catch (err) {
        addToast("Gallery failed to create", "error");
        setError('Error creating gallery item. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Gallery Item</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-2 p-2 w-full border rounded"
          />
        </div>

        {/* Image Field */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
            className="mt-2 p-2 w-full border rounded"
          />
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="mt-2 p-2 w-full border rounded"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-5 w-5"
          />
          <label htmlFor="isActive" className="text-sm">Active</label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2"
        >
          {loading ? 'Creating...' : 'Create Gallery Item'} <Plus size={16} />
        </button>
      </form>
    </div>
  );
}
