import axiosInstance from "./axiosConfig";
import { publicAxios } from "./axiosConfig";

export const checkUnapprovedUsers = async () => {
  try {
    const response = await axiosInstance.get("/admin/check-unapproved");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchSpecialists = async () => {
  try {
    // Using publicAxios to allow public access without authentication
    const response = await publicAxios.get("/users/specialists");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchUnapprovedSpecialists = async () => {
  try {
    const response = await axiosInstance.get("/admin/unapproved-specialists");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
