import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata = {
  title: 'TISL Admin',
  description: 'Terumo India Skill Lab — Admin Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-50 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
