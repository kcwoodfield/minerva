"use client"

import React from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import ThemeToggle from './ThemeToggle';
import Subtitle from './Subtitle';

const Header: React.FC = () => {
    const { theme } = useTheme();
    const [subtitleKey, setSubtitleKey] = React.useState(0);

    const handleLogoClick = () => {
        setSubtitleKey(prev => prev + 1);
    };

    return (
        <header className="static w-full">
            <nav className="flex items-center justify-between flex-wrap px-6 py-3 mx-auto">
                <div>
                    {/* <AddBook /> */}
                </div>
                <div 
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    onClick={handleLogoClick}
                >
                    <Image
                        src={theme === 'dark' ? '/logo/minerva-logo-dark.png' : '/logo/minerva-logo.png'}
                        alt="Minerva Logo"
                        width={90}
                        height={90}
                    />
                    <h1 className="text-3xl font-bold mb-0">
                        Minerva
                    </h1>
                    <Subtitle key={subtitleKey} />
                </div>
                <div>
                    {/* <ThemeToggle /> */}
                </div>
            </nav>
        </header>
    );
};

export default Header;