"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { fetchData } from "@/utils/api"
import { useSession } from "next-auth/react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function RatingsBreakdown() {
  const [series, setSeries] = useState([0, 0, 0, 0, 0]);
  const [isOpen, setIsOpen] = useState(false);

  const { data: session } = useSession()
  const token = session?.user?.jwt
  

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const data  = await fetchData("session-feedback/all/no-pagination", token);
        console.log(data)
        const counts = [0, 0, 0, 0, 0]; // Index 0 -> 1 star, Index 4 -> 5 stars

        data.forEach((feedback) => {
          const rating = Math.round(feedback.rating); // Assuming feedback.rating is from 1 to 5
          if (rating >= 1 && rating <= 5) {
            counts[rating - 1]++;
          }
        });

        setSeries(counts);
      } catch (error) {
        console.error("Failed to fetch feedback data", error);
      }
    }

    if(token) fetchFeedback();
  }, [token]);

  const totalFeedback = series.reduce((a, b) => a + b, 0);

  const options = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    colors: ["#EF4444", "#F59E0B", "#FACC15", "#10B981", "#3B82F6"],
    legend: {
      position: "bottom",
      fontSize: "14px",
      fontWeight: 500,
    },
    dataLabels: {
      enabled: true,
      formatter: (val, opts) => `${opts.w.config.series[opts.seriesIndex]}`
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} feedback`,
      },
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 300 },
        legend: { position: "bottom" }
      }
    }],
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Feedback Ratings
            </h3>
            <p className="mt-1 font-normal text-gray-500 text-sm dark:text-gray-400">
              Distribution of customer ratings
            </p>
          </div>

          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Details
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="pt-6">
          <ReactApexChart options={options} series={series} type="donut" height={320} />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Total Feedback Received: <span className="font-semibold text-gray-800 dark:text-white">{totalFeedback}</span>
        </p>
      </div>
    </div>
  );
}
