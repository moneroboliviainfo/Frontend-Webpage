const BRANCH_KEY = 'selected_branch_id';

export const BranchStorage = {
  getSelectedId(): number | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(BRANCH_KEY);
      if (!raw) return null;
      const id = Number(raw);
      return Number.isInteger(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
  },

  setSelectedId(id: number): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BRANCH_KEY, String(id));
    } catch {
      // ignore: a blocked localStorage just means the choice is not remembered
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(BRANCH_KEY);
    } catch {
      // ignore
    }
  },
};
