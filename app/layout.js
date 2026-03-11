import { Bungee, Roboto_Mono, VT323, Fira_Code } from 'next/font/google';
import './globals.css';

const bungee = Bungee({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-bungee',
});

const robotoMono = Roboto_Mono({
    weight: ['400', '500'],
    subsets: ['latin'],
    variable: '--font-roboto-mono',
});

const vt323 = VT323({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-vt323',
});

const firaCode = Fira_Code({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-fira-code',
});

export const metadata = {
    title: "Zemo's Vault",
    description: "Arcade game vault with retro games and lab code experiments. Play Snake, Tetris, Chess, Doom and more — plus browse syntax-highlighted programming experiments.",
    openGraph: {
        title: "Zemo's Vault",
        description: "Arcade game vault with retro games and lab code experiments.",
        type: 'website',
        siteName: "Zemo's Vault",
    },
    twitter: {
        card: 'summary',
        title: "Zemo's Vault",
        description: "Arcade game vault with retro games and lab code experiments.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`dark ${bungee.variable} ${robotoMono.variable} ${vt323.variable} ${firaCode.variable}`}>
            <body className="transition-colors duration-500" style={{ backgroundColor: '#000000' }} suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
