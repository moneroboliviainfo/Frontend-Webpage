import { API_URL } from '@/config/env';

interface Advertisement {
  id: number;
  text: string;
  enabled: boolean;
}

let cachedAdvertisement: Advertisement | null = null;
let fetchPromise: Promise<Advertisement | null> | null = null;

export const getAdvertisement = async (): Promise<Advertisement | null> => {
  // Return cached data if available
  if (cachedAdvertisement !== null) {
    return cachedAdvertisement;
  }

  // Return existing promise if fetch is in progress
  if (fetchPromise) {
    return fetchPromise;
  }

  // Create new fetch promise
  fetchPromise = fetch(`${API_URL}advertisements`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return null;
    })
    .then((data: Advertisement | null) => {
      cachedAdvertisement = data;
      fetchPromise = null;
      return data;
    })
    .catch((error) => {
      console.error('Error fetching advertisement:', error);
      fetchPromise = null;
      return null;
    });

  return fetchPromise;
};
