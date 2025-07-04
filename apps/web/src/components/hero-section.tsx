"use client";
import React from 'react';
import Link from 'next/link';

export const HeroSection: React.FC = () => {
  return (
    <section className="text-center py-20 bg-brand-background">
      <h1 className="text-5xl font-bold text-brand-primary">
        Live Like Royalty on Any Budget
      </h1>
      <p className="text-xl text-brand-text mt-4 max-w-2xl mx-auto">
        Your journey to financial freedom starts here. Get access to practical budgeting templates, tips, and tools designed for South Africans.
      </p>
      <div className="mt-8">
        <Link
          href="/templates"
          className="bg-brand-secondary text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition duration-300"
        >
          Get Your Free Templates
        </Link>
      </div>
    </section>
  );
};