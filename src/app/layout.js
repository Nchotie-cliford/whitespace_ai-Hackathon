import './globals.css'

export const metadata = {
  title: 'Hero.ai',
  description: 'AI-powered field dispatch for trades',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body data-phase="idle" data-board-risk="unknown">
        {children}
      </body>
    </html>
  )
}
