import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ADS_ACTIONS, AdType } from '../constants/ads';
// Async thunk to fetch all ads and sliders from API
export const fetchAdsAndSliders = createAsyncThunk(
  'ads/fetchAdsAndSliders',
  async () => {
    const response = await fetch('/api/ads');
    if (!response.ok) throw new Error('Failed to fetch ads and sliders');
    // Expected response: { advertisements: { homepage, men, women }, sliders: { homepage, men, women } }
    return response.json() as Promise<{
      advertisements: {
        homepage: Advertisement[];
        men: Advertisement[];
        women: Advertisement[];
      };
      sliders: {
        homepage: Slider[];
        men: Slider[];
        women: Slider[];
      };
    }>;
  }
);

export interface Advertisement {
  id: string;
  image: string;
  title: string;
  description?: string;
  type: AdType;
}

export interface Slider {
  id: string;
  image: string;
  title: string;
  isVertical: boolean;
  // Only homepage sliders have a redirection link
  link?: string;
  type: AdType;
}

interface AdState {
  advertisements: {
    homepage: Advertisement[];
    men: Advertisement[];
    women: Advertisement[];
  };
  sliders: {
    homepage: Slider[];
    men: Slider[];
    women: Slider[];
  };
}

const initialState: AdState = {
  advertisements: {
    homepage: [],
    men: [],
    women: [],
  },
  sliders: {
    homepage: [],
    men: [],
    women: [],
  },
};

const adSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    [ADS_ACTIONS.SET_HOMEPAGE_ADS](
      state,
      action: PayloadAction<Advertisement[]>
    ) {
      state.advertisements.homepage = action.payload;
    },
    [ADS_ACTIONS.SET_MEN_ADS](state, action: PayloadAction<Advertisement[]>) {
      state.advertisements.men = action.payload;
    },
    [ADS_ACTIONS.SET_WOMEN_ADS](state, action: PayloadAction<Advertisement[]>) {
      state.advertisements.women = action.payload;
    },
    [ADS_ACTIONS.SET_HOMEPAGE_SLIDERS](state, action: PayloadAction<Slider[]>) {
      state.sliders.homepage = action.payload;
    },
    [ADS_ACTIONS.SET_MEN_SLIDERS](state, action: PayloadAction<Slider[]>) {
      state.sliders.men = action.payload;
    },
    [ADS_ACTIONS.SET_WOMEN_SLIDERS](state, action: PayloadAction<Slider[]>) {
      state.sliders.women = action.payload;
    },
    [ADS_ACTIONS.CLEAR_ADS](state) {
      state.advertisements = { homepage: [], men: [], women: [] };
      state.sliders = { homepage: [], men: [], women: [] };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAdsAndSliders.fulfilled, (state, action) => {
      state.advertisements = action.payload.advertisements;
      state.sliders = action.payload.sliders;
    });
  },
});

export const {
  [ADS_ACTIONS.SET_HOMEPAGE_ADS]: setHomepageAds,
  [ADS_ACTIONS.SET_MEN_ADS]: setMenAds,
  [ADS_ACTIONS.SET_WOMEN_ADS]: setWomenAds,
  [ADS_ACTIONS.SET_HOMEPAGE_SLIDERS]: setHomepageSliders,
  [ADS_ACTIONS.SET_MEN_SLIDERS]: setMenSliders,
  [ADS_ACTIONS.SET_WOMEN_SLIDERS]: setWomenSliders,
  [ADS_ACTIONS.CLEAR_ADS]: clearAds,
} = adSlice.actions;
export default adSlice.reducer;
