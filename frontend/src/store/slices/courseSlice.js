import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { courseAPI } from '../../services/api';
// Async thunks
export const fetchCourses = createAsyncThunk('courses/fetchCourses', async (params, { rejectWithValue }) => {
  try {
    const response = await courseAPI.getCourses(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const fetchCourseById = createAsyncThunk('courses/fetchCourseById', async (id, { rejectWithValue }) => {
  try {
    const response = await courseAPI.getCourseById(id);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const createNewCourse = createAsyncThunk('courses/createCourse', async (data, { rejectWithValue }) => {
  try {
    const response = await courseAPI.createCourse(data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const updateCourseById = createAsyncThunk('courses/updateCourse', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await courseAPI.updateCourse(id, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const deleteCourseById = createAsyncThunk('courses/deleteCourse', async (id, { rejectWithValue }) => {
  try {
    await courseAPI.deleteCourse(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const publishCourseById = createAsyncThunk(
  'courses/publishCourse',
  async ({ id, isPublished }, { rejectWithValue }) => {
    try {
      const response = await courseAPI.publishCourse(id, isPublished);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getInstructorAllCourses = createAsyncThunk(
  'courses/getInstructorCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseAPI.getInstructorCourses();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Course slice
const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    allCourses: [],
    currentCourse: null,
    instructorCourses: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch courses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.allCourses = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch courses';
      });

    // Fetch single course
    builder
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch course';
      });

    // Create course
    builder
      .addCase(createNewCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.instructorCourses.push(action.payload);
      })
      .addCase(createNewCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create course';
      });

    // Get instructor courses
    builder
      .addCase(getInstructorAllCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInstructorAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.instructorCourses = action.payload;
      })
      .addCase(getInstructorAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch instructor courses';
      });

    // Delete course
    builder.addCase(deleteCourseById.fulfilled, (state, action) => {
      state.instructorCourses = state.instructorCourses.filter((c) => c._id !== action.payload);
    });
  },
});

export const { clearError, setCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
