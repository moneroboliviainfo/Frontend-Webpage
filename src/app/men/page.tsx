import NavBar from '@/components/nav/NavBar';
import styles from './men.module.css';

export default function MenPage() {
  return (
    <div className="relative min-h-screen bg-black">
      <NavBar />
      <div
        className="w-full"
        style={{ height: '80vh', background: 'var(--color-secondary)' }}
      >
        {/* Slider will go here */}
      </div>
    </div>
  );
}
