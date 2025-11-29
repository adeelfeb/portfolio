import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      <style jsx global>{`
        * {
          box-sizing: border-box;
          padding: 0;
          margin: 0;
        }
        html,
        body {
          max-width: 100vw;
          overflow-x: hidden;
          font-family: var(--font-poppins), 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .main-content {
          flex: 1;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

