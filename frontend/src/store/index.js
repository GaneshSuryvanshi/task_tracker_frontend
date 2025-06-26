import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./usersSlice";
import projectsReducer from "./projectsSlice";
import tasksReducer from "./tasksSlice";

export default configureStore({
  reducer: {
    users: usersReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
  },
});