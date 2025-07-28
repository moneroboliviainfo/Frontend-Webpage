import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Client {
  clientId: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  // Add more fields as needed
}

interface ClientState {
  client: Client | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const CLIENT_TOKEN_KEY = 'clientToken';

export const getClient = createAsyncThunk(
  'client/getClient',
  async (_, { rejectWithValue }) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem(CLIENT_TOKEN_KEY)
        : null;
    if (!token) return rejectWithValue('No token found');
    const response = await fetch('/api/client', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch client');
    return response.json() as Promise<Client>;
  }
);

export const updateClient = createAsyncThunk(
  'client/updateClient',
  async (client: Partial<Client>, { rejectWithValue }) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem(CLIENT_TOKEN_KEY)
        : null;
    if (!token) return rejectWithValue('No token found');
    const response = await fetch('/api/client', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(client),
    });
    if (!response.ok) throw new Error('Failed to update client');
    return response.json() as Promise<Client>;
  }
);

export const createClient = createAsyncThunk(
  'client/createClient',
  async (client: Omit<Client, 'clientId'>, { rejectWithValue }) => {
    const response = await fetch('/api/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    if (!response.ok) throw new Error('Failed to create client');
    const data = await response.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
    }
    return data.client as Client;
  }
);

const initialState: ClientState = {
  client: null,
  status: 'idle',
  error: null,
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    logout(state) {
      state.client = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CLIENT_TOKEN_KEY);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getClient.fulfilled, (state, action: PayloadAction<Client>) => {
        state.status = 'succeeded';
        state.client = action.payload;
      })
      .addCase(getClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(updateClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        updateClient.fulfilled,
        (state, action: PayloadAction<Client>) => {
          state.status = 'succeeded';
          state.client = action.payload;
        }
      )
      .addCase(updateClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(createClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        createClient.fulfilled,
        (state, action: PayloadAction<Client>) => {
          state.status = 'succeeded';
          state.client = action.payload;
        }
      )
      .addCase(createClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export const { logout } = clientSlice.actions;
export default clientSlice.reducer;

// Selector to get the client from state
export const selectClient = (state: { client: ClientState }) =>
  state.client.client;
