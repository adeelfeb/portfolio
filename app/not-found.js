import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(236, 72, 153, 0.1))',
    }}>
      <h1 style={{
        fontSize: '6rem',
        fontWeight: '700',
        margin: '0',
        color: '#1f2937',
        lineHeight: '1',
      }}>404</h1>
      <h2 style={{
        fontSize: '2rem',
        fontWeight: '600',
        margin: '1rem 0',
        color: '#374151',
      }}>Page Not Found</h2>
      <p style={{
        fontSize: '1.125rem',
        color: '#6b7280',
        marginBottom: '2rem',
        maxWidth: '32rem',
      }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #00a86b, #00c2a8)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.5rem',
          fontWeight: '600',
        }}
      >
        Go Back Home
      </Link>
    </div>
  );
}

