"use client"
import { useEffect, useState } from 'react';
import { fetchData, deleteData } from '@/utils/api';
import { Trash, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useToast } from '@/context/ToastContext';

export default function GalleryListPage() {
  const [galleries, setGalleries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast()

  const { data: session } = useSession()
  const token = session?.user?.jwt

  const loadGalleries = async () => {
    setLoading(true);
    const res = await fetchData(`galleries?page=${page}&limit=10`);
    if (res?.data) {
      setGalleries(res.data);
      setTotalPages(res.total);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this gallery item?')) {
      await deleteData(`galleries/${id}`, token);
      loadGalleries();
      addToast("Gallery deleted!")
    }
  };

  useEffect(() => {
    loadGalleries();
  }, [page]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gallery Management</h1>
        <Link href="/admin/galleries/add">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
            <Plus size={16} /> Add New
          </button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {galleries.map((gallery) => (
            <div key={gallery._id} className="flex items-center justify-between p-4 border rounded shadow">
              <div className="flex items-center gap-4">
                <img src={ process.env.NEXT_PUBLIC_NODE_BASE_URL +"/"+ gallery.photo } alt={gallery.title} className="w-20 h-20 object-cover rounded" />
                <div>
                  <h2 className="font-semibold text-lg">{gallery.title}</h2>
                  <p className="text-sm text-gray-600">{gallery.description}</p>
                  <p className={`text-sm mt-1 ${gallery.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {gallery.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/galleries/edit/${gallery._id}`}>
                  <button className="text-blue-600 hover:underline"><Pencil size={18} /></button>
                </Link>
                <button onClick={() => handleDelete(gallery._id)} className="text-red-600 hover:underline">
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-1">{page} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
