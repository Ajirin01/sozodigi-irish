"use client";

import { useState } from "react";
import { ShoppingBagIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Cart from "@/components/MiniCart";

export default function SubNav() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const openCart = () => {
    setIsCartOpen(true);
  };

  return (
    <div className="bg-white shadow-md py-3 px-4 flex w-full justify-center sm:justify-end items-center space-x-4">
      {/* Search Bar - Takes full width on mobile but limits width on larger screens */}
      <div className="relative flex-grow max-w-lg">
        <input
          type="text"
          className="w-full bg-gray-100  text-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
      </div>

      {/* Cart Button - Fixed size */}
      

      {/* Mini Cart */}
      <Cart cartItems={cartItems} setCartItems={setCartItems} isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </div>
  );
}
