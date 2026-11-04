import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/components/store/StoreProvider';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import { site } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL('https://humblesubscriptions.com'),
  title: {
    default: `${site.name} — Premium Subscriptions in Bangladesh`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    'subscriptions bangladesh',
    'netflix bangladesh',
    'spotify bangladesh',
    'canva pro',
    'youtube premium',
    'bkash subscription',
  ],
  openGraph: {
    title: `${site.name} — Premium Subscriptions in Bangladesh`,
    description: site.description,
    type: 'website',
    locale: 'en_BD',
    siteName: site.name,
  },
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased scroll-smooth"
      data-scroll-behavior="smooth"
      data-theme="dark"
      style={{ colorScheme: 'dark' }}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('humble.theme')==='light'){var d=document.documentElement;d.dataset.theme='light';d.style.colorScheme='light'}}catch(e){}",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <StoreProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
          <FloatingWhatsApp />
        </StoreProvider>
      </body>
    </html>
  );
}
