'use client';
import { useBranchInit } from '@/hooks/useBranchInit';

export default function BranchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useBranchInit();

  return <>{children}</>;
}
