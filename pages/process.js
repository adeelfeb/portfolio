import Head from 'next/head';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';
import Process from '../components/designndev/Process';

export default function ProcessPage() {
  return (
    <>
      <Head>
        <title>Our Process | Design n Dev - From Concept to Launch</title>
        <meta 
          name="description" 
          content="Our proven 4-step process: Discovery & Strategy, Design & Architecture, Agile Development, and Launch & Scale. We ensure your project is delivered on time and exceeds expectations." 
        />
        <meta 
          name="keywords" 
          content="web development process, agile development, project management, website development workflow, custom development process" 
        />
        <meta property="og:title" content="Our Process | Design n Dev" />
        <meta 
          property="og:description" 
          content="From concept to launch - our proven process ensures successful project delivery." 
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://designndev.com/process" />
      </Head>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Process />
        </main>
        <Footer />
      </div>
    </>
  );
}






