"use client";
import React, { useEffect, useState } from "react";
import Badge from "@/components/admin/ui/badge/Badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "@/icons";

import { fetchData } from "@/utils/api"
import { useSession } from "next-auth/react";

import Link from "next/link";
import { CalculatorIcon, Calendar } from "lucide-react";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";

export const EcommerceMetrics = () => {
  const [metrics, setMetrics] = useState({
    patients: 0,
    specialists: 0,
    orders: 0,
  });

  const { data: session } = useSession()
  const token = session?.user?.jwt

  const userRole = session?.user?.role

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [patientsRes, specialistsRes, ordersRes] = await Promise.all([
          userRole === "admin" && fetchData("users/get-all/no-pagination?role=user", token),
          fetchData("users/get-all/no-pagination?role=specialist", token),
          userRole !== "specialist" && fetchData("orders/filter/by", token),
        ]);

        console.log(patientsRes, specialistsRes, ordersRes)

        setMetrics({
          patients: patientsRes?.length || 0,
          specialists: specialistsRes?.length || 0,
          orders: ordersRes?.orders?.length || 0,
        });
      } catch (error) {
        console.error("Failed to load metrics", error);
      }
    }

    if(token) fetchMetrics();
  }, [token]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
      {/* Patients */}
      {userRole === "admin" && 
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Patients</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {metrics.patients}
              </h4>
            </div>
            {/* <Badge color="success">
              <ArrowUpIcon />
              +5.2%
            </Badge> */}
          </div>
        </div>
      }

      {/* Specialists */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Specialists</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.specialists}
            </h4>
          </div>
          {/* <Badge color="success">
            <ArrowUpIcon />
            +3.7%
          </Badge> */}
        </div>
      </div>

      {/* Orders */}
      { (userRole === "admin" || userRole === "user") && 
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Orders</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {metrics.orders}
              </h4>
            </div>
            {/* <Badge color="error">
              <ArrowDownIcon className="text-error-500" />
              -2.1%
            </Badge> */}
          </div>
        </div>
      }

      {/* consult a specialist now */}
      { (userRole === "user") && 
        <>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <ChatBubbleBottomCenterIcon className="text-gray-800 dark:text-white/90" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <Link href="/admin/available-specialists">
                <div className="border border-gray-300 rounded p-2">
                    <span className="text-md  rounded text-gray-500 dark:text-gray-400">Consult a Specialist Now</span>
                </div>
              </Link>
              {/* <Badge color="error">
                <ArrowDownIcon className="text-error-500" />
                -2.1%
              </Badge> */}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <ChatBubbleBottomCenterIcon className="text-gray-800 dark:text-white/90" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <Link href="/admin/consultation/book?consultationMode=now">
                <div className="border border-gray-300 rounded p-2">
                    <span className="text-md  rounded text-gray-500 dark:text-gray-400">Consult a doctor Now</span>
                </div>
              </Link>
              {/* <Badge color="error">
                <ArrowDownIcon className="text-error-500" />
                -2.1%
              </Badge> */}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <Calendar className="text-gray-800 dark:text-white/90" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <Link href="/admin/consultation/book?consultationMode=appointment">
                <div className="border border-gray-300 rounded p-2">
                    <span className="text-md  rounded text-gray-500 dark:text-gray-400">Book Consultation Appointment</span>
                </div>
              </Link>
              {/* <Badge color="error">
                <ArrowDownIcon className="text-error-500" />
                -2.1%
              </Badge> */}
            </div>
          </div>

        </>
        
      }
    </div>
  );
};
