// frontend\src\store\slices\authSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

interface User {
  user_id: string;
  org_id: string;
  role: string;
  exp: number;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
}

const token = localStorage.getItem("token");

let user = null;

if (token) {
  try {
    user = jwtDecode<User>(token);
  } catch (error) {
    console.log(error);
  }
}

const initialState: AuthState = {
  token,
  isAuthenticated: !!token,
  user,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.user = jwtDecode<User>(action.payload);
      localStorage.setItem("token", action.payload);
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("projectId");
      localStorage.removeItem("projectName");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
