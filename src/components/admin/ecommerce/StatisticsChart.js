"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";

// Dynamically import ApexCharts
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function StatisticsChart() {
  const [sessionData, setSessionData] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);
  const [chartCategories, setChartCategories] = useState([]);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  // Convert UNIX timestamp to readable date string (e.g., "July 3, 2025")
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calTotalRevenue = (payments) => {
    return payments.reduce((sum, payment) => {
      return sum + (payment.amount || 0) / 10;
    }, 0);
  };

  const fetchRevenue = async () => {
    try {
      const url = `payments/all/no-pagination`;
      const response = await fetchData(url, token);
      const payments = response.payments;
  
      setRevenueData(payments);
  
      const grouped = {};
      payments.forEach((payment) => {
        const date = formatDate(payment.created);
        const amount = (payment.amount || 0) / 100; // Stripe returns amount in cents
        const roundedAmount = Number(amount.toFixed(2)); // Round to 2 decimal places
  
        if (!grouped[date]) grouped[date] = 0;
        grouped[date] += roundedAmount;
      });
  
      const categories = Object.keys(grouped);
      const series = Object.values(grouped).map(val => Number(val.toFixed(2)));
  
      setChartCategories(categories);
      setChartSeries([{ name: "Revenue", data: series }]);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    }
  };
  

  useEffect(() => {
    fetchRevenue();
    // optionally fetchSessionData() or other datasets
  }, [token]);

  const chartOptions = {
    chart: {
      type: "bar",
    },
    xaxis: {
      categories: chartCategories,
    },
    title: {
      text: "Revenue Over Time",
    },
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Statistics</h2>
      {chartSeries.length > 0 && (
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={350}
        />
      )}
    </div>
  );
}
