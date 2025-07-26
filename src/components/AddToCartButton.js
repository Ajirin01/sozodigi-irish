"use client";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product, quantity, productType }) {
  const { addToCart } = useCart(); // ✅ This must exist

  if (!addToCart) {
    console.error("addToCart function is missing from useCart() context");
    return null;
  }

  return (
    <button 
      onClick={() => addToCart({product, quantity, productType})} 
      className="w-full rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Add to Cart
    </button>
  );
}


