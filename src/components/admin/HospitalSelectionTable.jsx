"use client";

import React, { useState, useEffect } from "react";
import { fetchData } from "@/utils/api";
import { FaSearch, FaHospital, FaGlobe, FaCheckCircle } from "react-icons/fa";

const HospitalSelectionTable = ({ token, selectedHospitalId, onSelect }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        let url = `hospitals?search=${search}&page=${page}&limit=5&sort=${sort}`;
        if (countryFilter) {
          url += `&country=${countryFilter}`;
        }
        const response = await fetchData(url, token);
        setHospitals(response.data);
        setPagination({
          page: response.page,
          pages: response.pages,
          total: response.total
        });
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      const delayDebounceFn = setTimeout(() => {
        fetchHospitals();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [token, search, countryFilter, sort, page]);

  useEffect(() => {
    const fetchCountries = async () => {
      if (!token) return;
      try {
        const response = await fetchData(`hospitals?limit=500`, token);
        const uniqueCountries = [...new Set(response.data.map(h => h.location?.country).filter(Boolean))].sort();
        setCountries(uniqueCountries);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };
    fetchCountries();
  }, [token]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Filters */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30">
        <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-3" />
              <input
                type="text"
                placeholder="Search hospital, specialty, or illness..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs text-gray-900 dark:text-white"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          <select
            className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none text-xs text-gray-900 dark:text-white"
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Countries</option>
            {countries.map((c, i) => (
              <option key={`country-${c}-${i}`} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto max-h-64 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-[10px] uppercase font-semibold">
              <th className="px-4 py-2">Hospital</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="2" className="px-4 py-3"><div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg"></div></td>
                </tr>
              ))
            ) : hospitals.length > 0 ? (
              hospitals.map((hospital) => {
                const isSelected = selectedHospitalId === hospital._id;
                return (
                  <tr 
                    key={hospital._id} 
                    className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50'}`}
                    onClick={() => onSelect(hospital._id)}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                          <FaHospital size={14} />
                        </div>
                        <div>
                          <p className={`font-semibold ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-white'}`}>{hospital.name}</p>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <FaGlobe size={8} /> {hospital.location?.country}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {isSelected ? (
                        <div className="flex items-center justify-center text-blue-600 font-bold gap-1">
                          <FaCheckCircle size={16} />
                          <span className="text-[10px]">Selected</span>
                        </div>
                      ) : (
                        <button 
                          className="px-3 py-1 text-[10px] font-bold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(hospital._id);
                          }}
                        >
                          Select
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                  <p className="text-xs">No hospitals found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mini Pagination */}
      {pagination?.pages > 1 && (
        <div className="p-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px]">
          <span className="text-gray-500">Page {page} of {pagination.pages}</span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-md disabled:opacity-30"
            >
              Prev
            </button>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(page + 1)}
              className="px-2 py-1 bg-blue-600 text-white rounded-md disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalSelectionTable;
