"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import { fetchData, postData, deleteData, updateData } from "@/utils/api";
import { useSession } from "next-auth/react";

import { useToast } from '@/context/ToastContext';

const CartContext = createContext();

const initialState = { items: [] };

const actionTypes = {
  SET_CART: "SET_CART",
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_ITEM: "UPDATE_ITEM",
  CLEAR_CART: "CLEAR_CART",
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_CART:
      return { ...state, items: action.payload };
    case actionTypes.ADD_ITEM:
      return { ...state, items: action.payload };
    case actionTypes.REMOVE_ITEM:
    case actionTypes.UPDATE_ITEM:
      return { ...state, items: action.payload };
    case actionTypes.CLEAR_CART:
      return { ...state, items: [] };
    case actionTypes.REFRESH_CART:
      return { ...state, items: state.items}
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const { addToast } = useToast();

  const alertSuccess = (msg) => addToast(msg, 'success');
  const alertError = (msg) => addToast(msg, 'error');

  useEffect(() => {
    if (token) {
      fetchData("cart/get/all", token)
        .then((data) => {
          console.log(data.items)
          if (data && Array.isArray(data.items)) {
            dispatch({ type: actionTypes.SET_CART, payload: data.items });
          }
        })
        .catch((error) => console.error("Error fetching cart:", error));
    }
  }, [token]);

  const addToCart = async (payload) => {
    // console.log("product", payload.product._id)
    if (!token) return;
    try {
      const res = await postData("cart/add/item", { productId: payload.product._id, quantity: payload.quantity, price: payload.product.price, prescriptionId: null, productType: payload.productType }, token, false);
      if (res && Array.isArray(res.cart.items)) {
        console.log(res)
        dispatch({ type: actionTypes.ADD_ITEM, payload: res.cart.items });
        alertSuccess("Item added to cart successfully")
      }
    } catch (error) {
      alertError("Failed to add to cart")
      console.error("Error adding to cart:", error);
    }
  };

  const refreshCart = async () => {
    fetchData("cart/get/all", token)
      .then((data) => {
        console.log(data.items)
        if (data && Array.isArray(data.items)) {
          dispatch({ type: actionTypes.SET_CART, payload: data.items });
        }
      })
      .catch((error) => console.error("Error fetching cart:", error));
  }

  const removeFromCart = async (itemId) => {
    if (!token) return;
    try {
      const res = await deleteData(`cart/remove/${itemId}`, token);
      if (res && Array.isArray(res.cart.items)) {
        dispatch({ type: actionTypes.SET_CART, payload: res.cart.items });
        alertSuccess("Item removed from cart successfully")
      }
    } catch (error) {
      alertError("Failed to remove item, try again")
      console.error("Error removing from cart:", error);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!token) return;

    try {
      const res = await updateData(`cart/update/custom`, { cartItemId: itemId, quantity }, token);
      console.log(res)
      if (res && Array.isArray(res.cart.items)) {
        dispatch({ type: actionTypes.UPDATE_ITEM, payload: res.cart.items });
        alertSuccess("Cart updated successfully")
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      alertError("Failed to update cart, try again!")
    }
  };

  const clearCart = async () => {
    if (!token) return;
    try {
      const res = await deleteData("cart", token);
      if (res) {
        dispatch({ type: actionTypes.CLEAR_CART });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <CartContext.Provider value={{ cart: state, addToCart, removeFromCart, updateCartItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
