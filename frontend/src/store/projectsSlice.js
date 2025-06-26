import { createSlice } from "@reduxjs/toolkit";

const projectsSlice = createSlice({
  name: "projects",
  initialState: [],
  reducers: {
    setProjects: (state, action) => action.payload,
  },
});

export const { setProjects } = projectsSlice.actions;
export default projectsSlice.reducer;