/**
 * Seasonal Discount Storage Utilities
 * Manages localStorage for seasonal discount modal dismissals
 */

export type ModalType = 'fullModal' | 'compactModal';
export type DismissReason = 'dismissed' | 'later';

interface DismissalState {
  discountId: string;
  dismissedAt: number;
  dismissReason: DismissReason;
}

const STORAGE_KEY = 'seasonalDiscountState';

/**
 * Get dismissal state for a specific modal type
 */
export function getSeasonalDiscountDismissal(
  modalType: ModalType,
): DismissalState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state = JSON.parse(stored);
    return state[modalType] || null;
  } catch (error) {
    console.error('Error reading seasonal discount dismissal state:', error);
    return null;
  }
}

/**
 * Check if modal should be shown based on dismissal history
 * Returns true if modal should be shown, false if it should be hidden
 */
export function shouldShowSeasonalModal(modalType: ModalType): boolean {
  const dismissal = getSeasonalDiscountDismissal(modalType);
  if (!dismissal) return true;

  const now = Date.now();
  const dismissedTime = dismissal.dismissedAt;

  // Dismissed with X button: hide for 24 hours
  if (dismissal.dismissReason === 'dismissed') {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return now - dismissedTime > twentyFourHours;
  }

  // Dismissed with "later": hide for 2 hours
  if (dismissal.dismissReason === 'later') {
    const twoHours = 2 * 60 * 60 * 1000;
    return now - dismissedTime > twoHours;
  }

  return true;
}

/**
 * Set dismissal state for a modal
 */
export function setSeasonalDiscountDismissal(
  modalType: ModalType,
  discountId: string,
  dismissReason: DismissReason,
): void {
  try {
    let state = {};

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      state = JSON.parse(stored);
    }

    state = {
      ...state,
      [modalType]: {
        discountId,
        dismissedAt: Date.now(),
        dismissReason,
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error setting seasonal discount dismissal state:', error);
  }
}

/**
 * Clear dismissal state for a specific modal type
 */
export function clearSeasonalDiscountDismissal(modalType: ModalType): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const state = JSON.parse(stored);
    delete state[modalType];

    if (Object.keys(state).length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (error) {
    console.error('Error clearing seasonal discount dismissal state:', error);
  }
}

/**
 * Clear all seasonal discount dismissal state
 */
export function clearAllSeasonalDiscountDismissals(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error(
      'Error clearing all seasonal discount dismissal states:',
      error,
    );
  }
}
