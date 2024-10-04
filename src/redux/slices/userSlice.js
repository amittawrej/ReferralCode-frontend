import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: null,
  isLoggedIn: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action) {
      state.isLoggedIn = true;
      state.userInfo = action.payload.user;
    },

    logout(state) {
      state.userInfo = null;
      state.isLoggedIn = false;
    },
  },
});

export const {
  login,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
