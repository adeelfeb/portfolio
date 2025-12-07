import Head from 'next/head';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';
import NewYearResolution from '../components/designndev/NewYearResolution';

export default function NewYearResolutionPage() {
  return (
    <>
      <Head>
        <title>New Year Resolution Service - Proof360</title>
        <meta 
          name="description" 
          content="Create, track, and achieve your New Year resolutions with our free service. Choose from templates or write your own." 
        />
        <meta 
          name="keywords" 
          content="new year resolution, goal setting, yearly goals, free resolution tracker" 
        />
        <meta property="og:title" content="New Year Resolution Service - Proof360" />
        <meta 
          property="og:description" 
          content="A dedicated space to define and conquer your goals for the year ahead." 
        />
        <meta property="og:type" content="website" />
      </Head>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <NewYearResolution />
        </main>
        <Footer />
      </div>
    </>
  );
}

