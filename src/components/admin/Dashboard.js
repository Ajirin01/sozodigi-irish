"use client"

import React from "react";
import { useSession } from "next-auth/react";


export default function Dashboard() {
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userRole = session?.user?.role;

  return (
    <div className="p-6 flex-1">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Stats Overview */}
      {userRole === "admin" && 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Total Orders</h2>
            <p className="text-2xl font-bold mt-2">1,234</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Pending Approvals</h2>
            <p className="text-2xl font-bold mt-2">56</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Revenue</h2>
            <p className="text-2xl font-bold mt-2">$12,345</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Users</h2>
            <p className="text-2xl font-bold mt-2">4,567</p>
          </div>
        </div>
      }

      {/* Recent Orders */}
      {userRole === "admin" &&
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Order ID</th>
                <th className="py-2 px-4 text-left">Customer</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2 px-4">#12345</td>
                <td className="py-2 px-4">John Doe</td>
                <td className="py-2 px-4 text-yellow-500">Pending</td>
                <td className="py-2 px-4">$99.99</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 px-4">#12346</td>
                <td className="py-2 px-4">Jane Smith</td>
                <td className="py-2 px-4 text-green-500">Completed</td>
                <td className="py-2 px-4">$199.99</td>
              </tr>
            </tbody>
          </table>
        </div>
      }
    </div>
  );
}
