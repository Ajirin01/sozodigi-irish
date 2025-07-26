"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Use useParams from next/navigation
import { fetchData } from '@/utils/api'; // adjust the path if different

export default function BlogViewPage() {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); // Get the blog id from the URL

  useEffect(() => {
    if (id) {
      const loadBlog = async () => {
        setLoading(true);
        try {
          const res = await fetchData(`blogs/${id}`); // Fetch blog based on the id
          console.log(res)
          setBlog(res);
        } catch (error) {
          console.error('Error fetching blog:', error);
        } finally {
          setLoading(false);
        }
      };
      loadBlog();
    }
  }, [id]); // Fetch blog when the id changes

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Blog not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-6">{blog.title}</h1>
      
      <img
        src={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${blog.featuredImage}` || '/images/blog-placeholder.jpg'}
        alt={blog.title}
        className="w-full h-96 object-cover rounded-lg mb-8"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/images/blog-placeholder.jpg';
        }}
      />

      <p className="text-xs text-gray-400 mb-4">{new Date(blog.createdAt).toLocaleDateString()}</p>
      
      <div
        className="text-lg text-gray-800"
        dangerouslySetInnerHTML={{
          __html: blog.content
        }}
      />
    </div>
  );
}
