import '../styles/globals.css';
import 'ag-grid-community/styles/ag-grid.min.css';
import 'ag-grid-community/styles/ag-theme-quartz.min.css';
import Head from 'next/head';
import { ToastProvider } from '../components/ToastProvider';

export default function App({ Component, pageProps }) {
  return (
    <ToastProvider>
      <Head>
        <title>Proof360 - Funding Intelligence Platform</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </ToastProvider>
  );
}
