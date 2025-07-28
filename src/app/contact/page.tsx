import NavBar from '@/components/nav/NavBar';

export default function ContactPage() {
  return (
    <>
      <NavBar />
      <main
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1>Contact Page</h1>
      </main>
    </>
  );
}
