import type {Metadata, Viewport} from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata = {
  title: "Regex to DFA Converter | Free Automata Tool",
  description:
    "Convert regular expressions to DFA instantly. Free online automata tool for students and developers.",
  keywords: [
    "regex to dfa",
    "dfa converter",
    "automata tool",
    "regex to dfa online"
  ],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1f2e21" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DFA Studio" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text></text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
         
         <script defer src="https://cloud.umami.is/script.js" data-website-id="ba18e9af-0e85-4d44-8a28-c41c2b5182c0"></script>
      
      </head>
      <body className="font-body antialiased prevent-layout-shift">{children}</body>
    </html>
  );
}
