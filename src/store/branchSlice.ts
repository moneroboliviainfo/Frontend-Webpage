import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiFetch } from '@/shared/api/client';
import { BranchStorage } from '@/shared/storage/branchStorage';
import type { RootState } from './store';

/** `GET /web-page/branches` returns only these two fields. */
export interface Branch {
  id: number;
  name: string;
}

type BranchStatus = 'idle' | 'loading' | 'ready' | 'error';

interface BranchState {
  branches: Branch[];
  selectedId: number | null;
  status: BranchStatus;
}

const initialState: BranchState = {
  branches: [],
  selectedId: null,
  status: 'idle',
};

/**
 * The list only includes branches that are active and have SIAT billing set up,
 * because an online sale invoices itself when the payment confirms. An empty
 * list therefore means online selling is not possible right now.
 */
export const fetchBranches = createAsyncThunk<Branch[]>(
  'branch/fetchBranches',
  async () => apiFetch<Branch[]>('web-page/branches'),
);

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    selectBranch: (state, action: PayloadAction<number>) => {
      if (!state.branches.some((b) => b.id === action.payload)) return;
      state.selectedId = action.payload;
      BranchStorage.setSelectedId(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.branches = action.payload;
        state.status = 'ready';

        // Keep the remembered branch only while it is still sellable: it can
        // drop off the list if it gets deactivated or loses SIAT billing.
        const remembered = BranchStorage.getSelectedId();
        const resolved =
          action.payload.find((b) => b.id === remembered) ?? action.payload[0];

        state.selectedId = resolved?.id ?? null;
        if (resolved && resolved.id !== remembered) {
          BranchStorage.setSelectedId(resolved.id);
        }
      })
      .addCase(fetchBranches.rejected, (state) => {
        state.status = 'error';
        state.branches = [];
        state.selectedId = null;
      });
  },
});

export const { selectBranch } = branchSlice.actions;

export const selectBranches = (state: RootState) => state.branch.branches;
export const selectBranchStatus = (state: RootState) => state.branch.status;
export const selectBranchId = (state: RootState) => state.branch.selectedId;

export const selectSelectedBranch = (state: RootState): Branch | null =>
  state.branch.branches.find((b) => b.id === state.branch.selectedId) ?? null;

/**
 * No branch means no `branchId` to send, and the reprice and the FedEx quote
 * reject an online sale without one — so checkout has to be blocked instead of
 * failing with a 400 at the end.
 */
export const selectCanSellOnline = (state: RootState) =>
  state.branch.status === 'ready' && state.branch.selectedId !== null;

export default branchSlice.reducer;
