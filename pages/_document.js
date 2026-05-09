import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Intentionally avoid loading Google Fonts here.
            App Router (`app/layout.js`) uses `next/font` for Poppins, which is optimized and non-blocking.
            Pages Router will fall back to system fonts unless a route explicitly loads a font. */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

// Ensure this file is only used by Pages Router
// This prevents conflicts with App Router's layout.js




