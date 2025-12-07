import Head from 'next/head';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';
import TechStack from '../components/designndev/TechStack';

export default function TechStackPage() {
  return (
    <>
      <Head>
        <title>Tech Stack | Design n Dev - Modern Web Technologies</title>
        <meta 
          name="description" 
          content="We use cutting-edge technologies including React.js, Next.js, Node.js, MongoDB, PostgreSQL, WordPress, Webflow, and cloud platforms like Vercel and AWS to build scalable applications." 
        />
        <meta 
          name="keywords" 
          content="React.js, Next.js, Node.js, MongoDB, PostgreSQL, WordPress, Webflow, Vercel, AWS, modern web technologies, tech stack" 
        />
        <meta property="og:title" content="Tech Stack | Design n Dev" />
        <meta 
          property="og:description" 
          content="Powered by modern technology - cutting-edge tools and frameworks for scalable applications." 
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://designndev.com/tech-stack" />
      </Head>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <TechStack />
        </main>
        <Footer />
      </div>
    </>
  );
}






