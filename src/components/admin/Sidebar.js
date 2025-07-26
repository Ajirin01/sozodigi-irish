"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const menuItems = [
  { name: "Dashboard", icon: "🏠", path: "/admin/dashboard" },
  { name: "Team", icon: "👥", path: "/admin/team" },
  { name: "Projects", icon: "📁", path: "/admin/projects" },
  { name: "Calendar", icon: "📅", path: "/admin/calendar" },
  { name: "Documents", icon: "📄", path: "/admin/documents" },
  { name: "Reports", icon: "📊", path: "/admin/reports" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-blue-600 text-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 text-lg font-bold">Admin Panel</div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link href={item.path}>
                <a
                  className={`flex items-center space-x-3 py-3 px-4 hover:bg-blue-500 ${
                    pathname === item.path ? "bg-blue-500" : ""
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
