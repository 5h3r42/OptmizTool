import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>&copy; {new Date().getFullYear()} OptmizTool. Built for performance.</p>
            </div>
        </footer>
    );
};