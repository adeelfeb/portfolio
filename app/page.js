import Navbar from '../components/designndev/Navbar'
import Hero from '../components/designndev/Hero'
import ValueProp from '../components/designndev/ValueProp'
import Services from '../components/designndev/Services'
import TechStack from '../components/designndev/TechStack'
import Process from '../components/designndev/Process'
import Footer from '../components/designndev/Footer'

export const metadata = {
  title: 'Design n Dev | Expert Full-Stack Web Development & Next.js Solutions',
  description: 'Turn your business idea into reality with Design n Dev. We specialize in fast, scalable custom development using Next.js, MERN Stack, and Node.js for startups and enterprises.',
  keywords: 'Next.js development, MERN stack agency, Startup MVP development, Full-stack web development, React development, Node.js development, custom web solutions, e-commerce development',
  openGraph: {
    title: 'Design n Dev | Expert Full-Stack Web Development & Next.js Solutions',
    description: 'Turn your business idea into reality with Design n Dev. We specialize in fast, scalable custom development using Next.js, MERN Stack, and Node.js for startups and enterprises.',
    url: 'https://designndev.com',
    siteName: 'Design n Dev',
    type: 'website',
  },
  alternates: {
    canonical: 'https://designndev.com',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ValueProp />
      <Services />
      <TechStack />
      <Process />
      <Footer />
    </main>
  )
}

