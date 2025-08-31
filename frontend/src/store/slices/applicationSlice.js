import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import applicationService from '../../services/applicationService'

const initialState = {
  applications: [],
  application: null,
  companyApplications: [],
  stats: {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
}

// Apply for internship
export const applyForInternship = createAsyncThunk(
  'applications/apply',
  async (applicationData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token
      return await applicationService.applyForInternship(applicationData, token)
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get user's applications
export const getMyApplications = createAsyncThunk(
  'applications/getMy',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token
      return await applicationService.getMyApplications(params, token)
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get company's applications
export const getCompanyApplications = createAsyncThunk(
  'applications/getCompany',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token
      return await applicationService.getCompanyApplications(params, token)
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get single application
export const getApplication = createAsyncThunk(
  'applications/getOne',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token
      return await applicationService.getApplication(id, token)
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Update application status
export const updateApplicationStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, status, note }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token
      return await applicationService.updateApplicationStatus(id, status, note, token)
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Withdraw application
export const withdrawApplication = createAsyncThunk(
  'applications/withdraw',
  async ({ id, reason }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token
      return await applicationService.withdrawApplication(id, reason, token)
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ''
    },
    clearApplication: (state) => {
      state.application = null
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyForInternship.pending, (state) => {
        state.isLoading = true
      })
      .addCase(applyForInternship.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.applications.unshift(action.payload.data)
      })
      .addCase(applyForInternship.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getMyApplications.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getMyApplications.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.applications = action.payload.data
        state.pagination = action.payload.pagination
        
        // Calculate stats
        state.stats = {
          total: action.payload.data.length,
          pending: action.payload.data.filter(app => app.status === 'pending').length,
          accepted: action.payload.data.filter(app => app.status === 'accepted').length,
          rejected: action.payload.data.filter(app => app.status === 'rejected').length,
        }
      })
      .addCase(getMyApplications.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getCompanyApplications.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCompanyApplications.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.companyApplications = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(getCompanyApplications.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getApplication.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getApplication.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.application = action.payload.data
      })
      .addCase(getApplication.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateApplicationStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.application = action.payload.data
        
        // Update in company applications list
        const index = state.companyApplications.findIndex(
          (app) => app._id === action.payload.data._id
        )
        if (index !== -1) {
          state.companyApplications[index] = action.payload.data
        }
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(withdrawApplication.pending, (state) => {
        state.isLoading = true
      })
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        
        // Update in applications list
        const index = state.applications.findIndex(
          (app) => app._id === action.meta.arg.id
        )
        if (index !== -1) {
          state.applications[index].status = 'withdrawn'
        }
      })
      .addCase(withdrawApplication.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset, clearApplication, setPagination } = applicationSlice.actions
export default applicationSlice.reducer
