import { configureStore } from "@reduxjs/toolkit";
import specialistReducer from "./specialistSlice";
import popUpReducer from "./popUpSlice"

export const store = configureStore({
  reducer: {
    specialist: specialistReducer,
    popUp: popUpReducer
  },
});
