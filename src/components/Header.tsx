import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, LogoIcon } from './Icons';

export const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <LogoIcon />
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        OptmizTool
                    </h1>
                </div>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
            </div>
        </header>
    );
};