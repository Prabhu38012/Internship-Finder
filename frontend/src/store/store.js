import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import internshipSlice from './slices/internshipSlice'
import applicationSlice from './slices/applicationSlice'
import notificationSlice from './slices/notificationSlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    internships: internshipSlice,
    applications: applicationSlice,
    notifications: notificationSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
