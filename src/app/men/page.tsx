export const metadata = {
  title: 'Hombres | Monero',
  description: 'Descubre la colección para hombres en Monero.',
};

import NavBar from '@/components/nav/NavBar';
import PageContainer from '../PageContainer';
import Footer from '@/components/Footer';

export default function MenPage() {
  return (
    <>
      <NavBar />
      <PageContainer gender="men" />
      <Footer />
    </>
  );
}
