import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import internshipService from "../../services/internshipService";

const initialState = {
  internships: [],
  internship: null,
  myInternships: [],
  savedInternships: [],
  suggestions: [],
  isLoadingSuggestions: false,
  filters: {
    search: "",
    category: "",
    location: "",
    type: "",
    remote: false,
    stipendMin: "",
    stipendMax: "",
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
  message: "",
};

// Get all internships
export const getInternships = createAsyncThunk(
  "internships/getAll",
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await internshipService.getInternships(params, token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Get single internship
export const getInternship = createAsyncThunk(
  "internships/getOne",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await internshipService.getInternship(id, token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Create internship
export const createInternship = createAsyncThunk(
  "internships/create",
  async (internshipData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await internshipService.createInternship(internshipData, token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Update internship
export const updateInternship = createAsyncThunk(
  "internships/update",
  async ({ id, internshipData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await internshipService.updateInternship(
        id,
        internshipData,
        token,
      );
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Delete internship
export const deleteInternship = createAsyncThunk(
  "internships/delete",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await internshipService.deleteInternship(id, token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Save/Unsave internship
export const toggleSaveInternship = createAsyncThunk(
  "internships/toggleSave",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await internshipService.toggleSaveInternship(id, token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Get company's internships
export const getMyInternships = createAsyncThunk(
  "internships/getMy",
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await internshipService.getMyInternships(params, token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Get internships with external sources
export const getInternshipsWithExternal = createAsyncThunk(
  "internships/getAllWithExternal",
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await internshipService.getInternshipsWithExternal(params, token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Search suggestions
export const searchSuggestions = createAsyncThunk(
  "internships/searchSuggestions",
  async (query, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await internshipService.getSearchSuggestions(query, token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const internshipSlice = createSlice({
  name: "internships",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearInternship: (state) => {
      state.internship = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateInternshipRealtime: (state, action) => {
      const { type, data } = action.payload;

      switch (type) {
        case "created":
          // Add new internship to the beginning of the list
          state.internships.unshift(data);
          break;
        case "updated":
          // Update existing internship
          const updateIndex = state.internships.findIndex(
            (i) => i._id === data._id,
          );
          if (updateIndex !== -1) {
            state.internships[updateIndex] = data;
          }
          // Update current internship if it's the same
          if (state.internship && state.internship._id === data._id) {
            state.internship = data;
          }
          break;
        case "deleted":
          // Remove internship from list
          state.internships = state.internships.filter(
            (i) => i._id !== data._id,
          );
          // Clear current internship if it's the deleted one
          if (state.internship && state.internship._id === data._id) {
            state.internship = null;
          }
          break;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInternships.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getInternships.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.internships = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getInternships.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getInternship.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getInternship.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.internship = action.payload.data;
      })
      .addCase(getInternship.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createInternship.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createInternship.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myInternships.unshift(action.payload.data);
      })
      .addCase(createInternship.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateInternship.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateInternship.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.internship = action.payload.data;
        const index = state.myInternships.findIndex(
          (internship) => internship._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.myInternships[index] = action.payload.data;
        }
      })
      .addCase(updateInternship.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteInternship.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteInternship.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myInternships = state.myInternships.filter(
          (internship) => internship._id !== action.meta.arg,
        );
      })
      .addCase(deleteInternship.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(toggleSaveInternship.fulfilled, (state, action) => {
        const internshipId = action.meta.arg;
        const isSaved = action.payload.saved;

        // Update internship in list
        const internshipIndex = state.internships.findIndex(
          (internship) => internship._id === internshipId,
        );
        if (internshipIndex !== -1) {
          state.internships[internshipIndex].isSaved = isSaved;
        }

        // Update current internship
        if (state.internship && state.internship._id === internshipId) {
          state.internship.isSaved = isSaved;
        }
      })
      .addCase(getMyInternships.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyInternships.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myInternships = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyInternships.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(searchSuggestions.pending, (state) => {
        state.isLoadingSuggestions = true;
      })
      .addCase(searchSuggestions.fulfilled, (state, action) => {
        state.isLoadingSuggestions = false;
        state.suggestions = action.payload.data;
      })
      .addCase(searchSuggestions.rejected, (state, action) => {
        state.isLoadingSuggestions = false;
        state.suggestions = [];
      })
      .addCase(getInternshipsWithExternal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getInternshipsWithExternal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.internships = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getInternshipsWithExternal.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const {
  reset,
  clearInternship,
  setFilters,
  clearFilters,
  setPagination,
  updateInternshipRealtime,
} = internshipSlice.actions;
export default internshipSlice.reducer;
