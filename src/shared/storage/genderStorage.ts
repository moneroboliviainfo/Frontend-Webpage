const GENDER_KEY = 'last_gender';

export const GenderStorage = {
  /**
   * Store the last visited gender page
   */
  storeGender(gender: string): void {
    if (typeof window === 'undefined') return;

    // Normalize gender to 'men' or 'women'
    const normalizedGender = gender.toLowerCase();
    let genderValue = 'women'; // default

    if (
      normalizedGender === 'men' ||
      normalizedGender === 'hombres' ||
      normalizedGender === 'male'
    ) {
      genderValue = 'men';
    } else if (
      normalizedGender === 'women' ||
      normalizedGender === 'mujeres' ||
      normalizedGender === 'female'
    ) {
      genderValue = 'women';
    }

    localStorage.setItem(GENDER_KEY, genderValue);
  },

  /**
   * Get the last visited gender page
   * Returns 'men' or 'women', defaults to 'women' if not set
   */
  getGender(): string {
    if (typeof window === 'undefined') return 'women';

    const stored = localStorage.getItem(GENDER_KEY);
    return stored === 'men' ? 'men' : 'women';
  },

  /**
   * Clear the stored gender
   */
  clearGender(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GENDER_KEY);
  },
};
