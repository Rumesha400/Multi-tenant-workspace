import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ProjectState {
  currentProjectId: string | null;
  currentProjectName: string | null;
}

const initialState: ProjectState = {
  currentProjectId: localStorage.getItem("projectId"),
  currentProjectName: localStorage.getItem("projectName"),
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProject: (
      state,
      action: PayloadAction<{ id: string; name: string }>,
    ) => {
      state.currentProjectId = action.payload.id;
      state.currentProjectName = action.payload.name;

      localStorage.setItem("projectId", action.payload.id);
      localStorage.setItem("projectName", action.payload.name);
    },

    clearProject: (state) => {
      state.currentProjectId = null;
      state.currentProjectName = null;

      localStorage.removeItem("projectId");
      localStorage.removeItem("projectName");
    },
  },
});
export const { setProject, clearProject } = projectSlice.actions;
export default projectSlice.reducer;
