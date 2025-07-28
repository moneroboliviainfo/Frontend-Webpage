import NavBar from '@/components/nav/NavBar';
import styles from './women.module.css';

export default function WomenPage() {
  return (
    <>
      <NavBar />
      <main className={styles.mainWomen}>
        <h1 className={styles.titleWomen}>Women&apos;s Clothing</h1>
        <p>Discover the newest trends in women&apos;s fashion.</p>
      </main>
    </>
  );
}
