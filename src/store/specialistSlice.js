import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  specialist: null,
  price: null,
  duration: null,
  appointmentDate: new Date().toISOString(),
  consultMode: "now",
  slot: {}
};

const specialistSlice = createSlice({
  name: "specialist",
  initialState,
  reducers: {
    setSpecialist(state, action) {
      state.specialist = action.payload;
    },
    setPrice(state, action) {
      state.price = action.payload;
    },
    setDuration(state, action) {
      state.duration = action.payload;
    },
    setAppointmentDate(state, action) {
      state.appointmentDate = action.payload;
    },
    setConsultMode(state, action) {
        state.consultMode = action.payload;
    },
    setSlot(state, action) {
      state.slot = action.payload;
    },
    resetBooking(state) {
      state.specialist = null;
      state.price = null;
      state.duration = null;
      state.appointmentDate = new Date().toISOString();
      state.consultMode = null
      state.slot = {}
    },
  },
});

export const {
  setSpecialist,
  setPrice,
  setDuration,
  setAppointmentDate,
  setConsultMode,
  setSlot,
  resetBooking,
} = specialistSlice.actions;

export default specialistSlice.reducer;
