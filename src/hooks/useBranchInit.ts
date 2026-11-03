'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBranches, selectBranchStatus } from '@/store/branchSlice';

/**
 * Loads the sellable branches once per session. Everything that quotes or sells
 * needs the chosen branch, so this runs at the app root rather than inside the
 * checkout.
 */
export const useBranchInit = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectBranchStatus);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBranches());
    }
  }, [dispatch, status]);
};
