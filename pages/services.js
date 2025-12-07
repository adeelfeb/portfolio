import Head from 'next/head';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';
import Services from '../components/designndev/Services';

export default function ServicesPage() {
  return (
    <>
      <Head>
        <title>Services | Design n Dev - Full-Stack Web Development Solutions</title>
        <meta 
          name="description" 
          content="Comprehensive web development services including custom full-stack development, Next.js solutions, CMS development, e-commerce platforms, and API integrations. Expert MERN Stack development." 
        />
        <meta 
          name="keywords" 
          content="web development services, full-stack development, Next.js development, MERN stack, e-commerce development, CMS development, WordPress, Webflow, API integration" 
        />
        <meta property="og:title" content="Services | Design n Dev" />
        <meta 
          property="og:description" 
          content="Comprehensive web development services tailored to your business needs." 
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://designndev.com/services" />
      </Head>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Services />
        </main>
        <Footer />
      </div>
    </>
  );
}






