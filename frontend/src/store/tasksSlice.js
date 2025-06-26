import { createSlice } from "@reduxjs/toolkit";

const tasksSlice = createSlice({
  name: "tasks",
  initialState: [],
  reducers: {
    setTasks: (state, action) => action.payload,
  },
});

export const { setTasks } = tasksSlice.actions;
export default tasksSlice.reducer;