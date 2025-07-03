import React from 'react';
import Link from 'next/link';
import { useStore } from '../store';

export const Header: React.FC = () => {
  const { isMobileMenuOpen, toggleMobileMenu } = useStore();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold" style={{ color: '#0A422D' }}>
              SA Budget Queen
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/templates" className="text-gray-500 hover:text-gray-900">
              Templates
            </Link>
            <Link href="/tips" className="text-gray-500 hover:text-gray-900">
              Tips
            </Link>
            <Link href="/about" className="text-gray-500 hover:text-gray-900">
              About
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-900">
              Contact
            </Link>
          </nav>
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-gray-500 hover:text-gray-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <nav className="pt-2 pb-4 space-y-1">
              <Link href="/templates" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Templates
              </Link>
              <Link href="/tips" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Tips
              </Link>
              <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                About
              </Link>
              <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};