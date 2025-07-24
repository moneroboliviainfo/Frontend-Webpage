export const AD_TYPES = {
  HOMEPAGE: 'homepage',
  MEN: 'men',
  WOMEN: 'women',
} as const;

export type AdType = (typeof AD_TYPES)[keyof typeof AD_TYPES];

export const ADS_ACTIONS = {
  SET_HOMEPAGE_ADS: 'ads/setHomepageAds',
  SET_MEN_ADS: 'ads/setMenAds',
  SET_WOMEN_ADS: 'ads/setWomenAds',
  SET_HOMEPAGE_SLIDERS: 'ads/setHomepageSliders',
  SET_MEN_SLIDERS: 'ads/setMenSliders',
  SET_WOMEN_SLIDERS: 'ads/setWomenSliders',
  CLEAR_ADS: 'ads/clearAds',
} as const;
