import { resError } from '@/helpers/functions';
import OrdersService from '@/services/OrdersService';
import TournamentService from '@/services/TournamentService';
import UserService from '@/services/UserService';
import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

export const getUsersCount = createAsyncThunk(
  'users/get-users-count',
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getUsersCount();

      return response?.data;
    } catch (e) {
      return rejectWithValue(resError(e));
    }
  }
);

export const getUsersActiveCount = createAsyncThunk(
  'users/get-users-active-count',
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getUsersActiveCount();

      return response?.data;
    } catch (e) {
      return rejectWithValue(resError(e));
    }
  }
);

export const getOrdersCount = createAsyncThunk(
  'orders/get-orders-count',
  async (_, { rejectWithValue }) => {
    try {
      const response = await OrdersService.getOrdersCount();

      return response?.data;
    } catch (e) {
      return rejectWithValue(resError(e));
    }
  }
);

export const getTournamentsCount = createAsyncThunk(
  'tournaments/get-tournaments-count',
  async (_, { rejectWithValue }) => {
    try {
      const response = await TournamentService.getTournamentsCount();

      return response?.data;
    } catch (e) {
      return rejectWithValue(resError(e));
    }
  }
);

export const getIntroCounts = createAsyncThunk(
  'intro/get-intro-counts',
  async (_, { rejectWithValue }) => {
    try {
      const [
        usersResponse,
        usersActiveResponse,
        ordersResponse,
        tournamentsResponse,
      ] = await Promise.allSettled([
        UserService.getUsersCount(),
        UserService.getUsersActiveCount(),
        OrdersService.getOrdersCount(),
        TournamentService.getTournamentsCount(),
      ]);

      const allSuccessful = [
        usersResponse,
        usersActiveResponse,
        ordersResponse,
        tournamentsResponse,
      ].every((response) => response.status === 'fulfilled');

      if (!allSuccessful) {
        const failedRequests = [
          usersResponse,
          usersActiveResponse,
          ordersResponse,
          tournamentsResponse,
        ].filter((response) => response.status === 'rejected');

        return rejectWithValue({
          message: 'Some requests failed',
          failedRequests: failedRequests.map((r) => r.reason),
        });
      }

      const result = [
        usersResponse.value?.data,
        usersActiveResponse.value?.data,
        ordersResponse.value?.data,
        tournamentsResponse.value?.data,
      ];

      return result;
    } catch (e) {
      return rejectWithValue(resError(e));
    }
  }
);

const handleIntroError = (state, action) => {
  state.errorMessage = action?.payload?.message;
  state.serverStatus = 'error';
  state.errorArray = action?.payload?.errors || null;
};

const handleIntroLoading = (state) => {
  state.serverStatus = 'loading';
  state.errorMessage = null;
  state.errorArray = null;
};

const initialState = {
  usersCount: 0,
  usersActiveCount: 0,
  ordersCount: 0,
  tournamentsCount: 0,
  serverStatus: '',
  errorMessage: null,
  errorArray: null,
};

const introSlice = createSlice({
  name: 'intro',
  initialState,
  reducers: {
    setUsersCount(state, action) {
      state.usersCount = action.payload;
    },
    clearUsersCount(state) {
      state.usersCount = 0;
    },
    setUsersActiveCount(state, action) {
      state.usersActiveCount = action.payload;
    },
    clearUsersActiveCount(state) {
      state.usersActiveCount = 0;
    },
    setOrdersCount(state, action) {
      state.ordersCount = action.payload;
    },
    clearOrdersCount(state) {
      state.ordersCount = 0;
    },
    setTournamentsCount(state, action) {
      state.tournamentsCount = action.payload;
    },
    clearTournamentsCount(state) {
      state.tournamentsCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // get intro counts
      .addCase(getIntroCounts.pending, (state) => handleIntroLoading(state))
      .addCase(getIntroCounts.fulfilled, (state, action) => {
        state.serverStatus = 'success';
        state.errorMessage = action.payload.message || null;
        state.errorArray = null;
        state.usersCount = action.payload[0];
        state.usersActiveCount = action.payload[1];
        state.ordersCount = action.payload[2];
        state.tournamentsCount = action.payload[3];
      })
      .addCase(getIntroCounts.rejected, handleIntroError)

      // get users count
      .addCase(getUsersCount.pending, (state) => handleIntroLoading(state))
      .addCase(getUsersCount.fulfilled, (state, action) => {
        state.serverStatus = 'success';
        state.errorMessage = action.payload.message || null;
        state.errorArray = null;
        state.usersCount = action.payload;
      })
      .addCase(getUsersCount.rejected, handleIntroError)

      // get users active count
      .addCase(getUsersActiveCount.pending, (state) =>
        handleIntroLoading(state)
      )
      .addCase(getUsersActiveCount.fulfilled, (state, action) => {
        state.serverStatus = 'success';
        state.errorMessage = action.payload.message || null;
        state.errorArray = null;
        state.usersActiveCount = action.payload;
      })
      .addCase(getUsersActiveCount.rejected, handleIntroError)

      // get orders count
      .addCase(getOrdersCount.pending, (state) => handleIntroLoading(state))
      .addCase(getOrdersCount.fulfilled, (state, action) => {
        state.serverStatus = 'success';
        state.errorMessage = action.payload.message || null;
        state.errorArray = null;
        state.ordersCount = action.payload;
      })
      .addCase(getOrdersCount.rejected, handleIntroError)

      // get tournaments count
      .addCase(getTournamentsCount.pending, (state) =>
        handleIntroLoading(state)
      )
      .addCase(getTournamentsCount.fulfilled, (state, action) => {
        state.serverStatus = 'success';
        state.errorMessage = action.payload.message || null;
        state.errorArray = null;
        state.tournamentsCount = action.payload;
      })
      .addCase(getTournamentsCount.rejected, handleIntroError);
  },
});

export const {
  setUsersCount,
  clearUsersCount,
  setUsersActiveCount,
  clearUsersActiveCount,
  setOrdersCount,
  clearOrdersCount,
  setTournamentsCount,
  clearTournamentsCount,
} = introSlice.actions;

export default introSlice.reducer;
