import { fakeUsers } from '@/helpers/constants';
import { resError } from '@/helpers/functions';
import TournamentService from '@/services/TournamentService';
import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

export const createTournament = createAsyncThunk(
  'create-tournament',
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await TournamentService.createTournament(data);

      return response?.data;
    } catch (e) {
      return rejectWithValue(resError(e));
    }
  }
);

export const addTournamentUser = createAsyncThunk(
  'add-tournament-user',
  async ({ email, exchange, id }, { rejectWithValue }) => {
    try {
      const response = await TournamentService.addTournamentUser(
        email,
        exchange,
        id
      );

      return response?.data;
    } catch (e) {
      return rejectWithValue(resError(e));
    }
  }
);

export const deleteTournament = createAsyncThunk(
  'delete-tournament',
  async (id, { rejectWithValue }) => {
    try {
      const response = await TournamentService.deleteTournament(id);

      return response?.data;
    } catch (e) {
      return rejectWithValue(resError(e));
    }
  }
);

export const removeTournamentUser = createAsyncThunk(
  'remove-tournament-user',
  async ({ tournamentId, userId }, { rejectWithValue }) => {
    try {
      const response = await TournamentService.removeTournamentUser(
        tournamentId,
        userId
      );
      return response?.data;
    } catch (e) {
      return rejectWithValue(resError(e));
    }
  }
);

export const getTournamentUsersList = createAsyncThunk(
  'tournament/get-tournament-users-list',
  async (id, { rejectWithValue }) => {
    try {
      const response = await TournamentService.getTournamentUsersList(id);

      return response?.data;
    } catch (e) {
      return rejectWithValue(resError(e));
    }
  }
);

const handleTournamentError = (state, action) => {
  state.errorMessage = action?.payload?.message;
  state.serverStatus = 'error';
};

const handleTournamentLoading = (state) => {
  state.serverStatus = 'loading';
  state.errorMessage = null;
};

const initialState = {
  fakeUsers: fakeUsers,
  tournament: {},
  users: [],
  tournamentUsersList: [],
  page: 1,
  size: 5,
  sort: { type: 'name', value: 'desc' },
  totalPages: 1,
  serverStatus: '',
  errorMessage: null,
};

const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    setTournament(state, action) {
      state.tournament = action.payload;
    },
    setUsers(state, action) {
      state.users = action.payload;
    },
    setTournamentUsersList(state, action) {
      state.tournamentUsersList = action.payload;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    setSize(state, action) {
      state.size = action.payload;
    },
    setSort(state, action) {
      state.sort = action.payload;
    },
    setTotalPages(state, action) {
      state.totalPages = action.payload;
    },

    clearTournaments() {
      return { ...initialState, fakeUsers: fakeUsers };
    },
    setErrorMessage(state, action) {
      state.errorMessage = action.payload;
    },
    clearTournamentUsersList(state) {
      state.tournamentUsersList = [];
    },
    setTournamentsFromWebSocket(state, action) {
      const { tournaments } = action.payload;

      if (
        !tournaments.tournament ||
        Object.keys(tournaments.tournament).length === 0
      ) {
        state.errorMessage = tournaments.message || 'Tournament not found';
        state.serverStatus = 'error';
        state.tournament = {};
        state.users = [];
        state.fakeUsers = fakeUsers;
        state.totalPages = 1;
      } else {
        state.errorMessage = null;
        state.serverStatus = 'success';
        state.tournament = tournaments.tournament;

        if (tournaments.users && tournaments.users.length > 0) {
          state.fakeUsers = null;
          state.users = tournaments.users;
        } else if (tournaments.message) {
          state.fakeUsers = null;
          state.users = [];
        } else {
          state.fakeUsers = fakeUsers;
          state.users = [];
        }

        state.totalPages = tournaments.total
          ? Math.ceil(tournaments.total / state.size)
          : state.totalPages;
      }
    },
  },
  extraReducers: (builder) => {
    builder

      //add-tournament-user
      .addCase(addTournamentUser.pending, (state) =>
        handleTournamentLoading(state)
      )
      .addCase(addTournamentUser.fulfilled, (state, action) => {
        state.errorMessage = action.payload.message || null;
        state.serverStatus = 'success';
        state.tournament = action.payload.tournament;
        state.fakeUsers = action.payload.users.length === 0 ? fakeUsers : null;
        state.users = action.payload.users;
        state.totalPages = action.payload.total
          ? Math.ceil(action.payload.total / state.size)
          : state.totalPages;
      })
      .addCase(addTournamentUser.rejected, handleTournamentError)

      //create-tournament
      .addCase(createTournament.pending, (state) =>
        handleTournamentLoading(state)
      )
      .addCase(createTournament.fulfilled, (state, action) => {
        state.errorMessage = action.payload.message || null;
        state.tournament = action.payload.tournament;
        state.users = action.payload.users;
        state.totalPages = action.payload.total
          ? Math.ceil(action.payload.total / state.size)
          : state.totalPages;
        state.fakeUsers = action.payload.users.length === 0 ? fakeUsers : null;
        state.serverStatus = 'success';
      })
      .addCase(createTournament.rejected, handleTournamentError)

      //delete-tournament
      .addCase(deleteTournament.fulfilled, (state) => {
        state.tournament = {};
        state.users = [];
        state.fakeUsers = fakeUsers;
        state.serverStatus = 'success';
        state.errorMessage = null;
      })
      .addCase(deleteTournament.rejected, handleTournamentError)

      //remove-tournament-user
      .addCase(removeTournamentUser.fulfilled, (state, action) => {
        state.serverStatus = 'success';
        state.errorMessage = null;

        if (action.meta?.arg?.userId && state.users) {
          state.users = state.users.filter(
            (user) => user.id !== action.meta.arg.userId
          );
          state.totalPages = Math.ceil(state.users.length / state.size);
        }

        if (!state.users) {
          state.users = [];
        }
      })
      .addCase(removeTournamentUser.rejected, handleTournamentError)

      //get-tournament-users-list
      .addCase(getTournamentUsersList.pending, (state) =>
        handleTournamentLoading(state)
      )
      .addCase(getTournamentUsersList.fulfilled, (state, action) => {
        state.tournamentUsersList = action.payload;
        state.serverStatus = 'success';
        state.errorMessage = null;
      })
      .addCase(getTournamentUsersList.rejected, handleTournamentError);
  },
});

export const {
  setTournament,
  setUsers,
  setPage,
  setSize,
  setSort,
  setTotalPages,
  clearTournaments,
  setErrorMessage,
  setTournamentUsersList,
  clearTournamentUsersList,
  setTournamentsFromWebSocket,
} = tournamentSlice.actions;

export default tournamentSlice.reducer;
