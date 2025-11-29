import { Poppins } from 'next/font/google'
import '../styles/globals.css'

const poppins = Poppins({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata = {
  title: 'Design n Dev | Expert Full-Stack Web Development & Next.js Solutions',
  description: 'Turn your business idea into reality with Design n Dev. We specialize in fast, scalable custom development using Next.js, MERN Stack, and Node.js for startups and enterprises.',
  keywords: 'Next.js development, MERN stack agency, Startup MVP development, Full-stack web development, React development, Node.js development',
  openGraph: {
    title: 'Design n Dev | Expert Full-Stack Web Development & Next.js Solutions',
    description: 'Turn your business idea into reality with Design n Dev. We specialize in fast, scalable custom development using Next.js, MERN Stack, and Node.js for startups and enterprises.',
    url: 'https://designndev.com',
    siteName: 'Design n Dev',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={`${poppins.className} antialiased bg-white`}>
        {children}
      </body>
    </html>
  )
}

