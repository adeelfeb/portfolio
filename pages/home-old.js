import Header from '../components/Header';
import Reference from '../components/Reference';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import Overview from '../components/Overview';
import { getUserFromRequest } from '../lib/auth';

export async function getServerSideProps(context) {
  const { req } = context;
  const user = await getUserFromRequest(req);

  if (user) {
    return { redirect: { destination: '/dashboard#valentine-urls', permanent: false } };
  }

  // No user session, show home page
  return { props: {} };
}

export default function Home() {
  return (
    <div className="home">
      <Header />
      <main>
        <Overview />
        <Reference
          stats={[
            '4.9 rated on Google',
            'Serving homeowners and businesses across Calgary year‑round',
          ]}
        />
        <CTA />
      </main>
      <Footer />
      <style jsx>{`
        .home { 
          background: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          width: 100%;
          position: relative;
        }
        .home main {
          flex: 1;
          width: 100%;
        }
        @media (max-width: 768px) {
          .home {
            overflow-x: hidden;
          }
          .home main {
            overflow-x: hidden;
          }
        }
      `}</style>
    </div>
  );
}

