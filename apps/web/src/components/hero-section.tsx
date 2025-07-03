import React from 'react';
import Link from 'next/link';
import { notify } from '../lib/notify';

export const HeroSection: React.FC = () => {
  return (
    <section className="text-center py-20">
      <h1 className="text-5xl font-bold" style={{ color: '#0A422D' }}>
        Live Like Royalty on Any Budget
      </h1>
      <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
        Your journey to financial freedom starts here. Get access to practical budgeting templates, tips, and tools designed for South Africans.
      </p>
      <div className="mt-8 space-x-4">
        <Link
          href="/templates"
          className="bg-yellow-500 text-white font-bold py-3 px-8 rounded-full hover:bg-yellow-600 transition duration-300"
          style={{ backgroundColor: '#D4AF37' }}
        >
          Get Your Free Templates
        </Link>
        <button
          onClick={() => notify.success('Welcome to the app!')}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition duration-300"
        >
          Test Notification
        </button>
      </div>
    </section>
  );
};