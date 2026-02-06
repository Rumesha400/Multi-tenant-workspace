// frontend\src\store\rootReducer.ts

import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "./slices/authSlice";
import projectReducer from "./slices/projectSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  project: projectReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export default rootReducer;
