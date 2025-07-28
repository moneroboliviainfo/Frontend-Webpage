'use client';
import NavBar from '@/components/NavBar';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black">
      <NavBar />
      <div
        className="w-full"
        style={{ height: '80vh', background: 'var(--color-secondary)' }}
      ></div>
    </div>
  );
}
