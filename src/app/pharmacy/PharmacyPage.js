'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchData } from '@/utils/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaStar, FaShoppingCart, FaDollarSign, FaChartLine } from 'react-icons/fa';

const MedicationsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPage = parseInt(searchParams.get("page")) || 1;
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: initialPage, pages: 1 });

  useEffect(() => {
    fetchProducts(initialPage);
  }, [initialPage]);

  const fetchProducts = async (page) => {
    setLoading(true);
    try {
      const response = await fetchData(`products?page=${page}`);
      if (response && Array.isArray(response.data)) {
        // console.log(response)
        setProducts(response.data);
        setFilteredProducts(response.data);
        setPagination({ total: response.total, page: response.page, pages: response.pages });

        const uniqueCategories = [...new Set(response.data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        router.push(`?page=${page}`, { scroll: false });
      }
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="bg-gradient-to-r from-[var(--color-primary-7)] to-[var(--color-primary-5)] text-white py-16 rounded-3xl">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Browse Medications</h1>
            <p className="text-xl opacity-90 mb-8">Explore high-quality medical supplies at the best prices</p>
            <div className="relative bg-white rounded-full max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medications..."
                className="w-full pl-10 pr-4 py-3 border-none rounded-full text-gray-800 focus:ring-2 focus:ring-[var(--color-primary-6)] shadow-md"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12">
        <div className="flex flex-wrap items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center flex-wrap gap-2">
            <FaFilter className="text-gray-500 mr-2" />
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-full text-sm ${selectedCategory === '' ? 'bg-[var(--color-primary-6)] text-white' : 'bg-gray-200 text-gray-700'}`}
            >All</button>
            {categories.map((cat, key) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm ${selectedCategory === cat._id ? 'bg-[var(--color-primary-6)] text-white' : 'bg-gray-200 text-gray-700'}`}
              >{cat.name}</button>
            ))}
          </div>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 ${viewMode === 'grid' ? 'bg-[var(--color-primary-6)] text-white' : 'bg-white text-gray-700'}`}>Grid</button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 ${viewMode === 'list' ? 'bg-[var(--color-primary-6)] text-white' : 'bg-white text-gray-700'}`}>List</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-600">No products found.</div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden bg-gray-50">
                  <img src={product.photo || '/images/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-[var(--color-primary-6)] text-sm font-medium mb-3">{product.category.name}</p>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <FaChartLine className="mr-2 text-gray-500" />
                    <span>{product.status}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <FaDollarSign className="mr-2 text-gray-500" />
                    <span className="text-gray-600 font-bold text-lg">₦{new Intl.NumberFormat().format(Math.round(product.price))}</span>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleViewDetails(product)}
                      className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 py-2 px-3 bg-[var(--color-primary-6)] hover:bg-[var(--color-primary-7)] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <FaShoppingCart className="mr-1.5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map(product => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg"
              >
                <div className="w-1/4 h-40 bg-gray-50">
                  <img src={product.photo || '/images/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.status}</p>
                  <p className="text-sm text-gray-500 mb-2">₦{new Intl.NumberFormat().format(Math.round(product.price))}</p>
                  <button className="mt-2 px-4 py-2 bg-[var(--color-primary-6)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-7)]">
                    Buy Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="mt-10 flex justify-center space-x-4">
            <button
              onClick={() => fetchProducts(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                pagination.page === 1 ? 'bg-gray-200 text-gray-500' : 'bg-[var(--color-primary-6)] text-white hover:bg-blue-700'}`}
            >Previous</button>
            <span className="px-4 py-2 text-gray-700 text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchProducts(pagination.page + 1)}
              disabled={pagination.page === pagination.pages || loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                pagination.page === pagination.pages ? 'bg-gray-200 text-gray-500' : 'bg-[var(--color-primary-6)] text-white hover:bg-[var(--color-primary-7)]'}`}
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationsPage;
